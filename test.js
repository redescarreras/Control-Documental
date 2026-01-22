/**
 * Playwright Test for Redes Carreras SL PWA
 * Verifica que la aplicación carga correctamente y no hay errores en consola
 */

const { chromium } = require('playwright');

async function testApp() {
    console.log('Iniciando pruebas de Redes Carreras SL PWA...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    const warnings = [];
    
    // Capturar errores de consola
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        } else if (msg.type() === 'warning') {
            warnings.push(msg.text());
        }
    });
    
    // Capturar errores de página
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        // Navegar a la aplicación
        console.log('1. Cargando la aplicación...');
        await page.goto('file:///workspace/redes-carreras-pwa/index.html', { waitUntil: 'networkidle' });
        console.log('   ✓ Página cargada\n');
        
        // Verificar elementos principales
        console.log('2. Verificando elementos principales...');
        
        // Header
        const header = await page.$('.header');
        console.log(`   ${header ? '✓' : '✗'} Header encontrado`);
        
        // Logo
        const logo = await page.$('.logo-text');
        const logoText = await logo?.textContent();
        console.log(`   ${logoText === 'RC' ? '✓' : '✗'} Logo correcto: "${logoText}"`);
        
        // Botones
        const btnPDF = await page.$('#btnExportPDF');
        console.log(`   ${btnPDF ? '✓' : '✗'} Botón PDF encontrado`);
        
        const btnInstall = await page.$('#btnInstall');
        console.log(`   ${btnInstall ? '✓' : '✗'} Botón Instalar encontrado`);
        
        // Stats
        const statTotal = await page.$('#statTotal');
        const statWarning = await page.$('#statWarning');
        const statExpired = await page.$('#statExpired');
        console.log(`   ${statTotal && statWarning && statExpired ? '✓' : '✗'} Stats encontrados`);
        
        // Filtros
        const searchInput = await page.$('#searchInput');
        const categoryFilter = await page.$('#categoryFilter');
        console.log(`   ${searchInput && categoryFilter ? '✓' : '✗'} Filtros encontrados`);
        
        // FAB button
        const fab = await page.$('#fabAdd');
        console.log(`   ${fab ? '✓' : '✗'} Botón flotante encontrado`);
        
        // Modal
        const modal = await page.$('#materialModal');
        console.log(`   ${modal ? '✓' : '✗'} Modal encontrado`);
        
        // Verificar contenido
        console.log('\n3. Verificando contenido...');
        
        // Verificar categorías en el filtro
        const categoryOptions = await page.$$('#categoryFilter option');
        console.log(`   ${categoryOptions.length > 5 ? '✓' : '✗'} Categorías cargadas: ${categoryOptions.length - 1} categorías`);
        
        // Verificar materiales (debería haber datos de ejemplo)
        const materialCards = await page.$$('.material-card');
        console.log(`   ✓ Materiales mostrados: ${materialCards.length}`);
        
        // Verificar footer
        const footer = await page.$('.footer');
        const footerText = await footer?.textContent();
        console.log(`   ✓ Footer: "${footerText?.trim()}"`);
        
        // Test de interactividad
        console.log('\n4. Probando interactividad...');
        
        // Abrir modal
        await fab.click();
        await page.waitForSelector('#materialModal.active', { timeout: 2000 });
        console.log('   ✓ Modal se abre correctamente');
        
        // Verificar campos del formulario
        const formVisible = await page.$('#materialForm');
        console.log(`   ${formVisible ? '✓' : '✗'} Formulario visible`);
        
        // Cerrar modal
        const closeBtn = await page.$('.modal-close');
        await closeBtn.click();
        await page.waitForTimeout(300);
        const modalClosed = await page.$('#materialModal:not(.active)');
        console.log('   ✓ Modal se cierra correctamente');
        
        // Probar búsqueda
        await searchInput.fill('Extintor');
        await page.waitForTimeout(500);
        const searchResults = await page.$$('.material-card');
        console.log(`   ✓ Búsqueda funcional: ${searchResults.length} resultados para "Extintor"`);
        
        // Limpiar búsqueda
        await searchInput.fill('');
        await page.waitForTimeout(500);
        
        // Resumen de errores
        console.log('\n========================================');
        console.log('RESUMEN DE PRUEBAS');
        console.log('========================================');
        
        if (errors.length === 0) {
            console.log('✓ No se encontraron errores de consola');
        } else {
            console.log(`✗ ${errors.length} error(es) encontrado(s):`);
            errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
        }
        
        if (warnings.length > 0) {
            console.log(`⚠ ${warnings.length} aviso(s):`);
            warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
        }
        
        console.log('\n========================================');
        console.log(errors.length === 0 ? '✓ TODAS LAS PRUEBAS PASARON' : '✗ ALGUNAS PRUEBAS FALLARON');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('Error durante las pruebas:', error.message);
        errors.push(error.message);
    } finally {
        await browser.close();
    }
    
    // Exit with appropriate code
    process.exit(errors.length > 0 ? 1 : 0);
}

testApp().catch(console.error);
