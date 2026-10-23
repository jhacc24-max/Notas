# Generador de íconos Miniatura 3D

Modela y renderiza los íconos del tipo 12 (ver `09-ICONOS.md` §2c).

- `modelos.js`: un modelo por ícono, armado con piezas simples (cajas redondeadas, cilindros, esferas, tornos y formas extruidas) y materiales mate compartidos (`C.white`, `C.dark`, `C.red`…).
- `render.html`: cámara en 3/4 a 30°, luz de estudio, sombra de contacto y encuadre automático; exporta PNG transparente de 512 px.
- `shoot.py`: abre la página en Chromium sin ventana y guarda cada ícono.

## Cómo usarlo

```bash
cd generador
npm i three@0.160.0
pip install playwright && playwright install chromium
python3 shoot.py salida            # todos los íconos
python3 shoot.py salida home,cart   # solo algunos
```

Luego convierte los PNG a .webp (calidad 88) y cópialos a `iconos/miniatura-3d/`.

## Agregar un ícono

1. En `modelos.js`, agrega una función al objeto `MODELS` (o `EXTRAS`) con el id del ícono. El objeto mira hacia +Z; el render lo escala, lo centra y lo apoya en el piso.
2. Usa solo los materiales de `C` y un color de acento por objeto.
3. Renderízalo y revísalo junto a los demás antes de usarlo.
