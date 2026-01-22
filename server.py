#!/usr/bin/env python3
"""
Servidor HTTP simple para Redes Carreras SL PWA
Requiere Python 3.x

Uso:
    python server.py [puerto]

El servidor se ejecutará en http://localhost:puerto
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuración
PORT = 8000
DIRECTORY = Path(__file__).parent.absolute()

class PWAHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador HTTP personalizado para servir la PWA"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Añadir headers necesarios para PWA
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Personalizar mensajes de log"""
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main():
    """Inicia el servidor HTTP"""
    
    # Cambiar al directorio del script
    os.chdir(DIRECTORY)
    
    # Verificar archivos necesarios
    required_files = ['index.html', 'app.js', 'styles.css', 'sw.js', 'manifest.json']
    missing = [f for f in required_files if not (DIRECTORY / f).exists()]
    
    if missing:
        print("ERROR: Archivos requeridos faltantes:")
        for f in missing:
            print(f"  - {f}")
        print("\nAsegúrate de estar en el directorio correcto.")
        sys.exit(1)
    
    # Determinar puerto
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"ERROR: Puerto inválido: {sys.argv[1]}")
            sys.exit(1)
    else:
        port = PORT
    
    # Iniciar servidor
    print("=" * 50)
    print("  Redes Carreras SL - PWA Server")
    print("=" * 50)
    print(f"\nDirectorio: {DIRECTORY}")
    print(f"Puerto: {port}")
    print(f"\nAccede a la aplicación en:")
    print(f"  http://localhost:{port}")
    print(f"\nPara instalar como PWA:")
    print(f"  1. Abre la URL en Chrome o Edge")
    print(f"  2. Busca el icono de instalación en la barra de direcciones")
    print(f"  3. Clic en 'Instalar'")
    print(f"\nPresiona Ctrl+C para detener el servidor")
    print("=" * 50 + "\n")
    
    try:
        with socketserver.TCPServer(("", port), PWAHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServidor detenido.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"ERROR: El puerto {port} ya está en uso.")
            print("Prueba con otro puerto:")
            print(f"  python server.py {port + 1}")
        else:
            print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
