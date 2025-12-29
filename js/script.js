document.addEventListener('DOMContentLoaded', () => {
    
    // Menú Hamburguesa
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Envío de Formulario vía AJAX (Sin salir de la página)
    const form = document.querySelector(".contacto-form");
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const status = document.createElement("p");
            status.style.marginTop = "15px";
            status.style.fontWeight = "bold";
            
            const data = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    status.innerHTML = "¡Gracias! Recibimos tu mensaje correctamente.";
                    status.style.color = "#00f2ff"; // Color Cyan de tu marca
                    form.reset();
                    // Opcional: Ocultar el botón después de enviar
                    form.querySelector("button").style.display = "none";
                } else {
                    status.innerHTML = "Ocurrió un error. Por favor, escribinos por WhatsApp.";
                    status.style.color = "#ff5f56";
                }
            } catch (error) {
                status.innerHTML = "Error de conexión. Intentá de nuevo.";
                status.style.color = "#ff5f56";
            }
            
            form.appendChild(status);
        });
    }

    // Scroll Suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});