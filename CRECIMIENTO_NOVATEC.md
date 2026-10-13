# Plan de reactivación comercial — NovaTec Engineering

**Día 1:** 12 de octubre de 2026  
**Día 30:** 10 de noviembre de 2026  
**Día 60:** 10 de diciembre de 2026

## Estrategia

NovaTec mantiene su sitio y sus redes existentes. El enfoque no es acumular vistas, sino crear confianza en empresarios paraguayos y convertir consultas calificadas en reuniones.

**Oferta prioritaria:** web corporativa, sistemas a medida y mantenimiento para PYMEs.  
**Primer segmento:** constructoras, arquitectura, ingeniería, estudios profesionales y consultoras.  
**Canales:** prospección directa (etapa 1), búsqueda orgánica, contenido, alianzas y recomendaciones (etapa 2).

## Indicadores de seguimiento

| Horizonte | Indicador | Meta inicial |
| --- | --- | --- |
| Día 30 | Clientes con anticipo recibido | 2 |
| Día 30 | Prospectos nuevos contactados | 200 |
| Día 60 | Consultas calificadas que no provienen de prospección en frío | 3 |
| Día 60 | Reuniones generadas por canales no fríos | 1 |
| Día 60 | Casos reales documentados | 3 |
| Día 60 | Contenidos educativos o demostraciones publicados | 8 |
| Día 60 | Posibles aliados contactados | 10 |

Las metas no son previsiones garantizadas. Se ajustan según conversiones reales.

## Qué es una consulta calificada

Una empresa o emprendimiento con necesidad relacionada a web, software o mantenimiento; una persona de contacto identificable; y posibilidad de avanzar a una conversación comercial. Consultas sobre cursos, preguntas técnicas genéricas o comentarios sin intención de contratación no cuentan como oportunidades.

## Plan de contenido (octubre a diciembre)

Priorizar videos cortos con demostraciones reales y casos que se puedan verificar:

1. Cáceres Álvarez: cómo se presentan áreas de práctica y contacto.
2. Power Gym: recorrido por su web y secciones.
3. GMI Uris Consulting: recorrido del sitio y estructura corporativa.
4. Vola: recorrido de funciones realmente disponibles.
5. Ejemplo conceptual claramente identificado: cómo se organiza el portafolio de una constructora.
6. Tres errores al presentar proyectos de construcción por WhatsApp.
7. Qué incluye un sitio corporativo y cuándo conviene un sistema de gestión.
8. Qué necesita tener listo una empresa antes de solicitar su web.

Cada contenido debe incluir una llamada a la acción específica: **"Conocé nuestros trabajos y solicitá una propuesta en novatec.com.py"**. No usar testimonios, métricas o resultados inventados.

## Enlaces rastreables para las biografías

Instagram:
https://novatec.com.py/?utm_source=instagram&utm_medium=social&utm_campaign=reactivacion_2026

TikTok:
https://novatec.com.py/?utm_source=tiktok&utm_medium=social&utm_campaign=reactivacion_2026

Cuando un visitante llegue por esos enlaces y complete un formulario, se incluirán los parámetros UTM junto con su solicitud. Esto NO mide todas las visitas: mide las solicitudes enviadas. Search Console es útil para estudiar búsquedas e impresiones; una herramienta de analítica web configurada con consentimiento apropiado puede medir más eventos.

## Control semanal (lunes)

- Contar consultas recibidas por formulario/WhatsApp.
- Clasificar fuente: Google, Instagram, TikTok, recomendación, directo o no identificado.
- Registrar en "Prospección NovaTec" empresa, necesidad, fuente, responsable, etapa y próxima acción.
- Verificar cuántas consultas son calificadas y cuántas terminan en reuniones.
- Actualizar contenido de la web y redes según señales reales, no según "likes".

## Operación técnica

- Web estática en GitHub Pages; archivos en la raíz y carpetas `css`, `js` e `img`.
- Formulario actual: Formspree, ID `xeeqrdlp`. Confirmar que siga asociado al correo de ventas vigente antes de lanzar campañas.
- Pruebas automáticas: `node scripts/check-site.mjs`; se ejecutan mediante GitHub Actions al abrir PR y al integrar en `main`.
- No colocar contraseñas, tokens, RUC privados, datos de prospectos ni información sensible dentro del repositorio público.
- Todo cambio de producción requiere revisión en rama, pruebas y publicación controlada.
- Antes de agregar nuevas cifras de proyectos/experiencia, validar documentación y que sean correctas.
- El precio de entrada de G. 1.250.000 es indicativo; sistemas a medida requieren diagnóstico y oferta formal.

## Próximas tareas fuera del código

- Revisar datos reales de Google Search Console, desde la cuenta autorizada.
- Confirmar recepción efectiva de ambos formularios en Formspree.
- Publicar las biografías con enlaces UTM.
- Elaborar casos de éxito con capturas y testimonios autorizados.
- Preparar una propuesta de mantenimiento mensual con alcance y SLA reales.
- Conseguir alianzas con contadores, consultores, agencias y proveedores de PYMEs.
