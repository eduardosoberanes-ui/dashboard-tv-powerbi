# Dashboard TV Power BI

Convierte un reporte de Power BI publicado en la web en una imagen `dashboard.png`
generada automáticamente por GitHub Actions y servida por GitHub Pages.

## Archivos principales

- `capture.js`: abre el enlace público de Power BI con Playwright y genera `site/dashboard.png`.
- `site/index.html`: página ligera para Fire TV / Amazon Silk. Solo muestra la imagen y la recarga cada 30 minutos.
- `.github/workflows/capture-and-deploy.yml`: automatiza captura y publicación cada 30 minutos.

## Configuración rápida

1. Crea un repositorio en GitHub.
2. Sube todos estos archivos.
3. Ve a `Settings > Secrets and variables > Actions > New repository secret`.
4. Crea el secret:
   - Name: `POWER_BI_URL`
   - Secret: tu enlace completo de Power BI publicado en la web.
5. Ve a `Settings > Pages`.
6. En `Build and deployment`, selecciona `GitHub Actions`.
7. Ve a `Actions`.
8. Ejecuta manualmente el workflow `Capturar y publicar dashboard`.
9. Abre la URL de GitHub Pages desde Amazon Silk.

## Ajustes útiles

En `.github/workflows/capture-and-deploy.yml` puedes cambiar:

```yaml
EXTRA_WAIT_MS: "75000"
```

Si la captura sale incompleta, aumenta a `90000` o `120000`.

En `capture.js` puedes cambiar el tamaño de captura:

```js
viewport: { width: 1920, height: 1080 }
```

## Nota

El reporte y la imagen resultante deben considerarse públicos si usas Power BI Publish to web y GitHub Pages público.
