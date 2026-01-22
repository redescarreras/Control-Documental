#!/bin/bash

# Script de descarga de jsPDF para Redes Carreras SL PWA
# Este script descarga la librería jsPDF necesaria para generar PDFs

echo "================================================"
echo "  Descargando jsPDF para Redes Carreras SL PWA"
echo "================================================"
echo ""

# Crear directorio libs si no existe
if [ ! -d "libs" ]; then
    echo "Creando directorio libs..."
    mkdir -p libs
fi

# URL de jsPDF
JSPDF_URL="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
JSPDF_FILE="libs/jspdf.umd.min.js"

echo "Descargando jsPDF desde CDN..."
echo "URL: $JSPDF_URL"
echo ""

# Verificar si curl está disponible
if command -v curl &> /dev/null; then
    curl -L -o "$JSPDF_FILE" "$JSPDF_URL"
    CURL_STATUS=$?
elif command -v wget &> /dev/null; then
    wget -O "$JSPDF_FILE" "$JSPDF_URL"
    WGET_STATUS=$?
else
    echo "ERROR: Ni curl ni wget están disponibles."
    echo "Por favor, descarga el archivo manualmente desde:"
    echo "$JSPDF_URL"
    echo ""
    echo "Y guárdalo en: $JSPDF_FILE"
    exit 1
fi

# Verificar si la descarga fue exitosa
if [ $CURL_STATUS -eq 0 ] || [ $WGET_STATUS -eq 0 ]; then
    if [ -f "$JSPDF_FILE" ] && [ -s "$JSPDF_FILE" ]; then
        FILE_SIZE=$(du -h "$JSPDF_FILE" | cut -f1)
        echo ""
        echo "================================================"
        echo "  ¡Descarga completada!"
        echo "================================================"
        echo ""
        echo "Archivo: $JSPDF_FILE"
        echo "Tamaño: $FILE_SIZE"
        echo ""
        echo "Ahora puedes ejecutar la aplicación."
        echo "La generación de PDFs estará disponible."
    else
        echo ""
        echo "ERROR: El archivo descarg está vacío o no existe."
        echo "Por favor, descarga manualmente desde:"
        echo "$JSPDF_URL"
        exit 1
    fi
else
    echo ""
    echo "ERROR: Fallo en la descarga."
    echo "Por favor, descarga el archivo manualmente:"
    echo "URL: $JSPDF_URL"
    echo "Ruta: $JSPDF_FILE"
    exit 1
fi

echo ""
echo "Presiona ENTER para continuar..."
read
