document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const labSelect = document.getElementById('labSelect');
    const springControls = document.getElementById('springControls');
    const pendulumControls = document.getElementById('pendulumControls');
    
    const massSlider = document.getElementById('massSlider');
    const lengthSlider = document.getElementById('lengthSlider');
    
    const canvas = document.getElementById('labCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas Constants
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const ORIGIN_X = WIDTH / 2;
    const ORIGIN_Y = 60;

    // Simulation Variables
    let currentLab = 'spring';
    let animationFrameId = null;

    // --- HOOKE'S LAW (SPRING) PARAMETERS ---
    let springMass = parseFloat(massSlider.value); // in grams
    const springConstant = 0.15; // N/m simulation constant
    const restLength = 120; // pixels
    let springY = restLength;
    let springVelocity = 0;

    // --- DAMPED PENDULUM PARAMETERS ---
    let ropeLength = parseFloat(lengthSlider.value); // meters
    let angle = Math.PI / 4; // 45 degrees initial release
    let angleVelocity = 0;
    let angleAcceleration = 0;
    const gravity = 9.81;
    const dampingFactor = 0.995; // Damping ratio for oscillation decay

    // Listeners for Switching Labs
    labSelect.addEventListener('change', (e) => {
        currentLab = e.target.value;
        if (currentLab === 'spring') {
            springControls.classList.remove('hidden');
            pendulumControls.classList.add('hidden');
            resetSpring();
        } else {
            springControls.classList.add('hidden');
            pendulumControls.classList.remove('hidden');
            resetPendulum();
        }
    });

    // Control Listeners
    massSlider.addEventListener('input', (e) => {
        springMass = parseFloat(e.target.value);
    });

    lengthSlider.addEventListener('input', (e) => {
        ropeLength = parseFloat(e.target.value);
        resetPendulum();
    });

    function resetSpring() {
        springMass = parseFloat(massSlider.value);
        springY = restLength + (springMass * 0.4);
        springVelocity = 0;
    }

    function resetPendulum() {
        angle = Math.PI / 4;
        angleVelocity = 0;
        angleAcceleration = 0;
    }

    // --- HOOKE'S LAW RENDERER ---
    function drawSpring() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Calculate Hooke's Law & Damped Harmonic Motion
        const targetExtension = restLength + (springMass * 0.5);
        const force = -springConstant * (springY - targetExtension);
        springVelocity += force;
        springVelocity *= 0.92; // Damping
        springY += springVelocity;

        // Draw Support Ceiling
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ORIGIN_X - 60, ORIGIN_Y);
        ctx.lineTo(ORIGIN_X + 60, ORIGIN_Y);
        ctx.stroke();

        // Draw Spring Coils
        const coils = 14;
        const coilWidth = 20;
        const step = (springY - ORIGIN_Y) / coils;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ORIGIN_X, ORIGIN_Y);

        for (let i = 1; i <= coils; i++) {
            const x = (i % 2 === 0) ? ORIGIN_X + coilWidth : ORIGIN_X - coilWidth;
            const y = ORIGIN_Y + (i * step);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(ORIGIN_X, springY);
        ctx.stroke();

        // Draw Hanging Weight Box
        if (springMass > 0) {
            const massSize = 30 + (springMass / 500) * 20;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(ORIGIN_X - massSize / 2, springY, massSize, massSize);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${springMass}g`, ORIGIN_X, springY + massSize / 2 + 4);
        }

        // Display Physics Data Labels
        const deltaX = Math.max(0, ((springY - restLength) / 10).toFixed(1));
        const forceVal = ((springMass * 0.00981)).toFixed(2);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Resting Length (L₀): ${restLength / 10} cm`, 20, HEIGHT - 70);
        ctx.fillText(`Displacement (Δx): ${deltaX} cm`, 20, HEIGHT - 45);
        ctx.fillText(`Restoring Force (F): ${forceVal} N`, 20, HEIGHT - 20);
    }

    // --- DAMPED PENDULUM RENDERER ---
    function drawPendulum() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Equation of Motion for Damped Pendulum
        const pixelLength = ropeLength * 120; // Scale length for canvas
        angleAcceleration = (-1 * gravity / (ropeLength * 10)) * Math.sin(angle);
        angleVelocity += angleAcceleration;
        angleVelocity *= dampingFactor; // Damping
        angle += angleVelocity;

        // Calculate Bob Position
        const bobX = ORIGIN_X + pixelLength * Math.sin(angle);
        const bobY = ORIGIN_Y + pixelLength * Math.cos(angle);

        // Draw Anchor Pivot
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(ORIGIN_X, ORIGIN_Y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw Rope
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ORIGIN_X, ORIGIN_Y);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Draw Pendulum Bob
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Display Physics Data Labels
        const period = (2 * Math.PI * Math.sqrt(ropeLength / gravity)).toFixed(2);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Length (L): ${ropeLength.toFixed(2)} m`, 20, HEIGHT - 70);
        ctx.fillText(`Theoretical Period (T): ${period} s`, 20, HEIGHT - 45);
        ctx.fillText(`Current Angle (θ): ${(angle * (180 / Math.PI)).toFixed(1)}°`, 20, HEIGHT - 20);
    }

    // Main Animation Loop
    function animate() {
        if (currentLab === 'spring') {
            drawSpring();
        } else {
            drawPendulum();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    // Start Simulation Loop
    animate();
});