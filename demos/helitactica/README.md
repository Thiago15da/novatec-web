# Helitáctica — Demo pública del CRM y Centro de Operaciones (v0.4)

Esta carpeta se sirve en `https://novatec.com.py/demos/helitactica/` desde GitHub Pages de NovaTec.

**Importante:** Esta publicación es una **simulación comercial 100% local en el navegador**. No implementa el backend FastAPI, no ejecuta Python, no comparte datos entre visitantes, no tiene autenticación real, no envía WhatsApp, no conecta Meta, no muestra información de clientes, ni recoge métricas aeronáuticas o de incendios auténticas. Los roles y el login son demostrativos, no seguridad de producción. **No utilizar para operar el negocio ni presentar los informes como resultados reales.**

## Qué se puede probar
- Dashboard comercial ficticio de tres áreas: Taxi aéreo, Escuela y Experiencias.
- Bandeja con mensajes inventados, respuestas simuladas y cambio de etapa.
- Enrutamiento determinista del simulador de consultas y prueba de intervención humana.
- Campañas ficticias de Control de Incendios, creación de operativos, estados y bitácora.
- Informe ejecutivo mensual y reporte de incendios, exportación a CSV e impresión/PDF.
- Login de demostración como `gerente`, `taxi`, `escuela` o `experiencias` con contraseña **`HeliDemo2026!`**. Inicia automáticamente como `gerente` a menos que la URL incluya `?login=1`.
- Botón **Restaurar escenario** reinicia registros ficticios del navegador.

## Cómo funciona
Se reutilizan el HTML, CSS y JS visuales de Helitáctica v0.4. `demo-api.js` implementa **respuestas simuladas en memoria** para las rutas internas `/api/*` utilizando `window.fetch`. Los registros solo se almacenan en `sessionStorage` del mismo navegador/pestaña; no existe API ni base compartida y nunca se envían datos a un servidor por esos endpoints. Los informes se recalculan con los registros ficticios de ese navegador.

## Paso siguiente de producción
Para que el gerente y los tres vendedores compartan datos verdaderos y accedan desde distintos equipos, hace falta un backend desplegado (FastAPI + base de datos gestionada), permisos reales, SSL, backups, control de acceso y la integración oficial aprobada con Meta WhatsApp Cloud API/Coexistence. La versión de laboratorio local v0.4 continúa separada.

NovaTec Engineering · Octubre 2026.