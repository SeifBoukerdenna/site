import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';


interface ShapeUserData {
    originalPosition: THREE.Vector3;
    rotationSpeed: {
        x: number;
        y: number;
        z: number;
    };
    floatSpeed: number;
    floatRange: number;
}

interface OrbUserData {
    originalPosition: THREE.Vector3;
    phase: number;
    speed: number;
}

const Portfolio: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const [currentSection, setCurrentSection] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const mountElement = mountRef.current;
        if (!mountElement) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountElement.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x4fc3f7, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x64b5f6, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Create complex particle system
        const createParticleSystem = (count: number, color: number, size: number, speed: number): THREE.Points => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const velocities = new Float32Array(count * 3);

            for (let i = 0; i < count * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 20;
                positions[i + 1] = (Math.random() - 0.5) * 20;
                positions[i + 2] = (Math.random() - 0.5) * 20;

                velocities[i] = (Math.random() - 0.5) * speed;
                velocities[i + 1] = (Math.random() - 0.5) * speed;
                velocities[i + 2] = (Math.random() - 0.5) * speed;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

            const material = new THREE.PointsMaterial({
                size: size,
                color: color,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
            });

            return new THREE.Points(geometry, material);
        };

        // Multiple particle systems
        const particleSystems: THREE.Points[] = [
            createParticleSystem(200, 0x4fc3f7, 0.02, 0.01),
            createParticleSystem(100, 0x64b5f6, 0.04, 0.005),
            createParticleSystem(50, 0x42a5f5, 0.06, 0.008),
        ];

        particleSystems.forEach(system => scene.add(system));

        // Morphing geometric shapes
        const shapes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>[] = [];
        const shapeTypes = [
            () => new THREE.IcosahedronGeometry(0.4),
            () => new THREE.OctahedronGeometry(0.4),
            () => new THREE.TetrahedronGeometry(0.5),
            () => new THREE.DodecahedronGeometry(0.3),
        ];

        for (let i = 0; i < 8; i++) {
            const geometry = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]();
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL((i * 0.1) % 1, 0.7, 0.6),
                wireframe: true,
                transparent: true,
                opacity: 0.4,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15
            );

            mesh.userData = {
                originalPosition: mesh.position.clone(),
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02,
                },
                floatSpeed: Math.random() * 0.01 + 0.005,
                floatRange: Math.random() * 2 + 1,
            } as ShapeUserData;

            shapes.push(mesh);
            scene.add(mesh);
        }

        // Interactive floating orbs
        const orbs: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>[] = [];
        for (let i = 0; i < 12; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
                transparent: true,
                opacity: 0.6,
                emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1),
            });

            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12
            );

            orb.userData = {
                originalPosition: orb.position.clone(),
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01,
            } as OrbUserData;

            orbs.push(orb);
            scene.add(orb);
        }

        // Spiral galaxy effect
        const createGalaxy = (): THREE.Points => {
            const geometry = new THREE.BufferGeometry();
            const count = 300;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const radius = Math.random() * 8;
                const spinAngle = radius * 0.5;
                const branchAngle = (i % 3) * (Math.PI * 2 / 3);

                const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
                const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
                const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;

                positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
                positions[i * 3 + 1] = randomY;
                positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

                const color = new THREE.Color();
                color.setHSL(0.6, 0.8, Math.random() * 0.5 + 0.5);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.03,
                sizeAttenuation: true,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
            });

            return new THREE.Points(geometry, material);
        };

        const galaxy = createGalaxy();
        galaxy.position.z = -5;
        scene.add(galaxy);

        camera.position.z = 8;

        // Mouse movement handler
        const handleMouseMove = (event: MouseEvent): void => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const clock = new THREE.Clock();

        const animate = (): void => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Camera movement based on mouse
            camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.02;
            camera.position.y += (mouseRef.current.y * 2 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            // Animate particle systems
            particleSystems.forEach((system, index) => {
                system.rotation.y += 0.001 * (index + 1);
                system.rotation.x += 0.0005 * (index + 1);

                const positions = system.geometry.attributes.position.array as Float32Array;
                const velocities = system.geometry.attributes.velocity.array as Float32Array;

                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    // Boundary check and bounce
                    if (Math.abs(positions[i]) > 10) velocities[i] *= -1;
                    if (Math.abs(positions[i + 1]) > 10) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 10) velocities[i + 2] *= -1;
                }

                system.geometry.attributes.position.needsUpdate = true;
            });

            // Animate shapes with complex movements
            shapes.forEach((shape, index) => {
                const userData = shape.userData as ShapeUserData;

                shape.rotation.x += userData.rotationSpeed.x;
                shape.rotation.y += userData.rotationSpeed.y;
                shape.rotation.z += userData.rotationSpeed.z;

                // Floating movement
                shape.position.y = userData.originalPosition.y +
                    Math.sin(elapsedTime * userData.floatSpeed + index) * userData.floatRange;

                // Mouse interaction
                const distance = shape.position.distanceTo(camera.position);
                const mouseInfluence = 1 / (distance * 0.5 + 1);
                shape.position.x += mouseRef.current.x * mouseInfluence * 0.5;
                shape.position.z += mouseRef.current.y * mouseInfluence * 0.5;

                // Color shifting
                const hue = (elapsedTime * 0.1 + index * 0.1) % 1;
                shape.material.color.setHSL(hue, 0.7, 0.6);
            });

            // Animate orbs with orbital motion
            orbs.forEach((orb,) => {
                const userData = orb.userData as OrbUserData;
                const time = elapsedTime * userData.speed + userData.phase;

                orb.position.x = userData.originalPosition.x + Math.cos(time) * 2;
                orb.position.z = userData.originalPosition.z + Math.sin(time) * 2;
                orb.position.y = userData.originalPosition.y + Math.sin(time * 2) * 0.5;

                // Pulsing effect
                const scale = 1 + Math.sin(time * 3) * 0.3;
                orb.scale.setScalar(scale);
            });

            // Rotate galaxy
            galaxy.rotation.y += 0.002;
            galaxy.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;

            renderer.render(scene, camera);
        };

        animate();
        setIsLoaded(true);

        // Handle resize
        const handleResize = (): void => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (mountElement && renderer.domElement && mountElement.contains(renderer.domElement)) {
                mountElement.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Handle scroll with parallax
    useEffect(() => {
        const handleScroll = (): void => {
            const sections = document.querySelectorAll('.section');
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            sections.forEach((section, index) => {
                const htmlElement = section as HTMLElement;
                const sectionTop = htmlElement.offsetTop;
                const sectionHeight = htmlElement.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    setCurrentSection(index);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (index: number): void => {
        const section = document.querySelector(`.section:nth-child(${index + 1})`) as HTMLElement;
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="portfolio">
            {/* Three.js Canvas */}
            <div ref={mountRef} className="threejs-canvas" />

            {/* Glass Background Elements */}
            <div className="glass-bg-elements">
                <div className="floating-glass glass-1"></div>
                <div className="floating-glass glass-2"></div>
                <div className="floating-glass glass-3"></div>
                <div className="floating-glass glass-4"></div>
            </div>

            {/* Loading Screen */}
            {!isLoaded && (
                <div className="loading-screen">
                    <div className="loading-container">
                        <div className="loading-orb"></div>
                        <div className="loading-text">Loading Experience...</div>
                        <div className="loading-progress">
                            <div className="progress-bar"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Island Navigation */}
            <nav className="dynamic-island">
                <div className="island-content">
                    <div className="nav-logo">
                        <span className="logo-text">Portfolio</span>
                        <div className="logo-orb"></div>
                    </div>
                    <div className="nav-links">
                        {['Home', 'About', 'Projects', 'Contact'].map((item, index) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(index)}
                                className={`nav-link ${currentSection === index ? 'active' : ''}`}
                            >
                                <span>{item}</span>
                                <div className="nav-link-glow"></div>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section hero">
                <div className="glass-card hero-card">
                    <div className="glass-overlay"></div>
                    <div className="hero-content">
                        <div className="floating-badge">
                            <div className="badge-glow"></div>
                            <span>✨ Available for Projects</span>
                        </div>
                        <h1 className="hero-title">
                            Hello, I'm <span className="gradient-text">Alex Johnson</span>
                        </h1>
                        <p className="hero-subtitle">Full Stack Developer & Creative Technologist</p>
                        <p className="hero-description">
                            I craft digital experiences that blend beautiful design with cutting-edge technology,
                            creating immersive and interactive solutions that push the boundaries of what's possible.
                        </p>
                        <div className="hero-buttons">
                            <button onClick={() => scrollToSection(2)} className="primary-button">
                                <span>View My Work</span>
                                <div className="button-glow"></div>
                                <div className="button-shine"></div>
                            </button>
                            <button onClick={() => scrollToSection(3)} className="secondary-button">
                                <span>Get in Touch</span>
                                <div className="button-glass-effect"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section about">
                <div className="container">
                    <div className="glass-card section-card">
                        <div className="glass-overlay"></div>
                        <h2 className="section-title">About Me</h2>
                        <div className="about-content">
                            <div className="about-text">
                                <div className="text-glass-container">
                                    <p>
                                        I'm a passionate developer with 5+ years of experience creating web applications
                                        that solve real-world problems. I specialize in React, Three.js, and modern web technologies,
                                        with a focus on creating immersive digital experiences that captivate and inspire.
                                    </p>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-item glass-stat">
                                        <div className="stat-glow"></div>
                                        <div className="stat-number">50+</div>
                                        <div className="stat-label">Projects</div>
                                    </div>
                                    <div className="stat-item glass-stat">
                                        <div className="stat-glow"></div>
                                        <div className="stat-number">5+</div>
                                        <div className="stat-label">Years</div>
                                    </div>
                                    <div className="stat-item glass-stat">
                                        <div className="stat-glow"></div>
                                        <div className="stat-number">100%</div>
                                        <div className="stat-label">Passion</div>
                                    </div>
                                </div>
                                <div className="skills">
                                    {['React', 'Three.js', 'Node.js', 'TypeScript', 'Python', 'AWS', 'WebGL', 'GSAP'].map((skill) => (
                                        <div key={skill} className="skill-tag">
                                            <div className="skill-glass"></div>
                                            <span>{skill}</span>
                                            <div className="skill-glow"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="section projects">
                <div className="container">
                    <div className="glass-card section-card">
                        <div className="glass-overlay"></div>
                        <h2 className="section-title">Featured Projects</h2>
                        <div className="projects-grid">
                            {[
                                {
                                    title: "E-Commerce Platform",
                                    description: "Full-stack shopping platform with React and Node.js, featuring real-time inventory, AI-powered recommendations, and seamless payment integration",
                                    tech: ["React", "Node.js", "MongoDB", "AI"],
                                    status: "Live",
                                    image: "🛒"
                                },
                                {
                                    title: "3D Portfolio Website",
                                    description: "Interactive portfolio using Three.js and WebGL with advanced particle systems, immersive animations, and cutting-edge visual effects",
                                    tech: ["Three.js", "React", "GLSL", "WebGL"],
                                    status: "Featured",
                                    image: "🌟"
                                },
                                {
                                    title: "AI Chat Application",
                                    description: "Real-time chat app with AI integration, featuring natural language processing, smart responses, and advanced conversation management",
                                    tech: ["React", "Socket.io", "OpenAI", "Python"],
                                    status: "Beta",
                                    image: "🤖"
                                }
                            ].map((project, index) => (
                                <div key={index} className="project-card">
                                    <div className="project-glass"></div>
                                    <div className="project-image">
                                        <div className="emoji-container">
                                            <span className="project-emoji">{project.image}</span>
                                            <div className="emoji-glow"></div>
                                        </div>
                                        <div className="project-status">
                                            <div className="status-glow"></div>
                                            {project.status}
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        <div className="project-tech">
                                            {project.tech.map((tech) => (
                                                <span key={tech} className="tech-tag">
                                                    <div className="tech-glass"></div>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <button className="project-button">
                                            <div className="project-button-glass"></div>
                                            <span>View Project</span>
                                            <div className="button-arrow">→</div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section contact">
                <div className="container">
                    <div className="glass-card section-card">
                        <div className="glass-overlay"></div>
                        <h2 className="section-title">Let's Connect</h2>
                        <div className="contact-content">
                            <div className="contact-intro">
                                <p>Ready to bring your ideas to life? Let's create something amazing together!</p>
                            </div>
                            <div className="contact-grid">
                                <a href="mailto:alex@example.com" className="contact-card">
                                    <div className="contact-glass"></div>
                                    <div className="contact-icon">
                                        <span>📧</span>
                                        <div className="icon-glow"></div>
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-label">Email</div>
                                        <div className="contact-value">alex@example.com</div>
                                    </div>
                                </a>
                                <a href="https://linkedin.com/in/alexjohnson" className="contact-card">
                                    <div className="contact-glass"></div>
                                    <div className="contact-icon">
                                        <span>💼</span>
                                        <div className="icon-glow"></div>
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-label">LinkedIn</div>
                                        <div className="contact-value">@alexjohnson</div>
                                    </div>
                                </a>
                                <a href="https://github.com/alexjohnson" className="contact-card">
                                    <div className="contact-glass"></div>
                                    <div className="contact-icon">
                                        <span>🚀</span>
                                        <div className="icon-glow"></div>
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-label">GitHub</div>
                                        <div className="contact-value">@alexjohnson</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif;
          background: radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 40%, #0f1419 100%);
          color: #ffffff;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        .portfolio {
          position: relative;
          min-height: 100vh;
        }

        .threejs-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }

        /* Glass Background Elements */
        .glass-bg-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }

        .floating-glass {
          position: absolute;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: floatGlass 15s ease-in-out infinite;
        }

        .glass-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: 5%;
          animation-delay: -2s;
        }

        .glass-2 {
          width: 200px;
          height: 200px;
          top: 60%;
          right: 10%;
          animation-delay: -8s;
        }

        .glass-3 {
          width: 150px;
          height: 150px;
          top: 30%;
          right: 20%;
          animation-delay: -5s;
        }

        .glass-4 {
          width: 250px;
          height: 250px;
          bottom: 20%;
          left: 15%;
          animation-delay: -12s;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(30px) saturate(150%);
        }

        .loading-container {
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .loading-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(45deg, #4fc3f7, #29b6f6, #03a9f4);
          animation: pulse 2s infinite, rotate 3s linear infinite;
          margin: 0 auto 20px;
          box-shadow:
            0 0 60px rgba(79, 195, 247, 0.6),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
        }

        .loading-text {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 20px;
        }

        .loading-progress {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4fc3f7, #29b6f6);
          border-radius: 2px;
          animation: loadingProgress 2s ease-in-out infinite;
        }

        /* Dynamic Island Navigation */
        .dynamic-island {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          animation: slideDown 0.8s ease-out;
        }

        .island-content {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 30px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(79, 195, 247, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .island-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .island-content:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: scale(1.02);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(79, 195, 247, 0.2);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #4fc3f7, #29b6f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-orb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(45deg, #4fc3f7, #29b6f6);
          box-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
          animation: orbPulse 2s ease-in-out infinite;
        }

        .nav-links {
          display: flex;
          gap: 8px;
        }

        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 10px 18px;
          border-radius: 18px;
          transition: all 0.3s ease;
          position: relative;
          font-weight: 500;
          overflow: hidden;
        }

        .nav-link-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.1);
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-link:hover .nav-link-glow,
        .nav-link.active .nav-link-glow {
          opacity: 1;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #4fc3f7;
          background: rgba(79, 195, 247, 0.15);
          backdrop-filter: blur(10px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Sections */
        .section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
        }

        /* Glass Card */
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 50px;
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(79, 195, 247, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.5), transparent);
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }

        /* Hero Section */
        .hero-card {
          max-width: 1000px;
          text-align: center;
          animation: fadeInUp 1s ease-out;
        }

        .floating-badge {
          display: inline-block;
          background: rgba(79, 195, 247, 0.15);
          border: 1px solid rgba(79, 195, 247, 0.3);
          border-radius: 25px;
          padding: 12px 20px;
          margin-bottom: 40px;
          font-size: 0.9rem;
          color: #4fc3f7;
          position: relative;
          overflow: hidden;
          animation: float 3s ease-in-out infinite;
        }

        .badge-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(79, 195, 247, 0.3), transparent);
          animation: badgeGlow 3s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 5.5rem);
          font-weight: 800;
          margin-bottom: 25px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(45deg, #4fc3f7, #29b6f6, #03a9f4, #0288d1);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease-in-out infinite;
        }

        .hero-subtitle {
          font-size: clamp(1.3rem, 4vw, 2rem);
          margin-bottom: 25px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }

        .hero-description {
          font-size: 1.2rem;
          margin-bottom: 50px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
        }

        .hero-buttons {
          display: flex;
          gap: 25px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .primary-button {
          background: linear-gradient(45deg, #4fc3f7, #29b6f6);
          border: none;
          color: white;
          padding: 18px 36px;
          font-size: 1.1rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(79, 195, 247, 0.4);
        }

        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(79, 195, 247, 0.5);
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: buttonShine 3s ease-in-out infinite;
        }

        .primary-button:hover .button-glow {
          left: 100%;
        }

        .secondary-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 18px 36px;
          font-size: 1.1rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .button-glass-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .secondary-button:hover .button-glass-effect {
          opacity: 1;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
          border-color: rgba(79, 195, 247, 0.4);
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section-card {
          width: 100%;
          max-width: 1200px;
        }

        .section-title {
          font-size: clamp(2.2rem, 6vw, 4rem);
          text-align: center;
          margin-bottom: 60px;
          background: linear-gradient(45deg, #ffffff, #4fc3f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        /* About Section */
        .about-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .about-text {
          max-width: 900px;
        }

        .text-glass-container {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 50px;
        }

        .about-text p {
          font-size: 1.3rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.85);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 50px;
        }

        .glass-stat {
          position: relative;
          overflow: hidden;
        }

        .stat-item {
          text-align: center;
          padding: 30px 20px;
          background: rgba(79, 195, 247, 0.08);
          border-radius: 20px;
          border: 1px solid rgba(79, 195, 247, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          position: relative;
        }

        .stat-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          border-color: rgba(79, 195, 247, 0.4);
        }

        .stat-item:hover .stat-glow {
          opacity: 1;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: #4fc3f7;
          margin-bottom: 10px;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          font-size: 1.1rem;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: center;
        }

        .skill-tag {
          background: rgba(79, 195, 247, 0.12);
          border: 1px solid rgba(79, 195, 247, 0.3);
          padding: 15px 25px;
          border-radius: 25px;
          font-weight: 600;
          color: #4fc3f7;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(15px);
        }

        .skill-glass {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .skill-tag:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(79, 195, 247, 0.3);
          border-color: rgba(79, 195, 247, 0.5);
        }

        .skill-tag:hover .skill-glass {
          opacity: 1;
        }

        .skill-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .skill-tag:hover .skill-glow {
          left: 100%;
        }

        /* Projects Section */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 35px;
          margin-top: 30px;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 35px;
          backdrop-filter: blur(25px);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .project-glass {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.05);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-card:hover {
          transform: translateY(-10px);
          border-color: rgba(79, 195, 247, 0.4);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .project-card:hover .project-glass {
          opacity: 1;
        }

        .project-image {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .emoji-container {
          position: relative;
        }

        .project-emoji {
          font-size: 3.5rem;
          background: rgba(79, 195, 247, 0.15);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(79, 195, 247, 0.3);
          backdrop-filter: blur(10px);
          display: block;
        }

        .emoji-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.2);
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-card:hover .emoji-glow {
          opacity: 1;
        }

        .project-status {
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
          padding: 8px 16px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(76, 175, 80, 0.3);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .status-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(76, 175, 80, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-card:hover .status-glow {
          opacity: 1;
        }

        .project-content {
          flex: 1;
        }

        .project-title {
          font-size: 1.5rem;
          margin-bottom: 18px;
          color: #4fc3f7;
          font-weight: 700;
        }

        .project-description {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 25px;
          line-height: 1.7;
          font-size: 1rem;
        }

        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
        }

        .tech-tag {
          background: rgba(41, 182, 246, 0.15);
          color: #29b6f6;
          padding: 8px 16px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(41, 182, 246, 0.3);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .tech-glass {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(41, 182, 246, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-card:hover .tech-glass {
          opacity: 1;
        }

        .project-button {
          background: rgba(79, 195, 247, 0.12);
          border: 1px solid rgba(79, 195, 247, 0.3);
          color: #4fc3f7;
          padding: 15px 25px;
          border-radius: 15px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(15px);
          position: relative;
          overflow: hidden;
        }

        .project-button-glass {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-button:hover {
          background: rgba(79, 195, 247, 0.2);
          transform: translateX(8px);
          border-color: rgba(79, 195, 247, 0.5);
        }

        .project-button:hover .project-button-glass {
          opacity: 1;
        }

        .button-arrow {
          transition: transform 0.3s ease;
        }

        .project-button:hover .button-arrow {
          transform: translateX(5px);
        }

        /* Contact Section */
        .contact-content {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .contact-intro {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 50px;
        }

        .contact-intro p {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 25px;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
        }

        .contact-glass {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.05);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .contact-card:hover {
          background: rgba(79, 195, 247, 0.08);
          border-color: rgba(79, 195, 247, 0.3);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .contact-card:hover .contact-glass {
          opacity: 1;
        }

        .contact-icon {
          font-size: 2.2rem;
          background: rgba(79, 195, 247, 0.15);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(79, 195, 247, 0.3);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .icon-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(79, 195, 247, 0.2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .contact-card:hover .icon-glow {
          opacity: 1;
        }

        .contact-info {
          text-align: left;
        }

        .contact-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 6px;
        }

        .contact-value {
          font-size: 1.2rem;
          color: #4fc3f7;
          font-weight: 600;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes floatGlass {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        @keyframes badgeGlow {
          0%, 100% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
        }

        @keyframes buttonShine {
          0%, 100% {
            transform: translateX(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(100%) rotate(45deg);
          }
        }

        @keyframes loadingProgress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dynamic-island {
            top: 15px;
          }

          .island-content {
            padding: 10px 20px;
            gap: 20px;
          }

          .nav-links {
            gap: 6px;
          }

          .nav-link {
            padding: 8px 14px;
            font-size: 0.8rem;
          }

          .glass-card {
            padding: 30px 25px;
            margin: 10px;
            border-radius: 24px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .projects-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .skills {
            justify-content: center;
          }

          .floating-glass {
            display: none;
          }

          .loading-container {
            padding: 30px;
          }

          .section {
            padding: 20px 10px;
          }
        }

        @media (max-width: 480px) {
          .glass-card {
            padding: 25px 20px;
          }

          .hero-title {
            font-size: clamp(2rem, 8vw, 4rem);
          }

          .section-title {
            font-size: clamp(1.8rem, 6vw, 3rem);
          }

          .contact-card {
            padding: 20px;
            gap: 15px;
          }

          .project-card {
            padding: 25px;
          }
        }
      `}</style>
        </div>
    );
};

export default Portfolio;