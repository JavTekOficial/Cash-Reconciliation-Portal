export type SupportedLang = 'es' | 'en';

export const TRANSLATIONS: Record<SupportedLang, Record<string, string>> = {
  es: {
    // Header & Brand
    'APP_TITLE': 'Bóveda de Efectivo - Portal de Conciliación',
    'APP_SUBTITLE': 'Recepción de bolsas de depósito y conciliación de efectivo de tiendas',
    'LANGUAGE': 'Idioma',
    'LANG_ES': 'Español',
    'LANG_EN': 'English',
    'NEW_DEPOSIT_BTN': 'Registrar Depósito',
    'REFRESH': 'Actualizar',

    // Dashboard KPIs
    'DASHBOARD_TITLE': 'Panel de Control',
    'TOTAL_DEPOSITS': 'Total de Depósitos',
    'RECONCILED_DEPOSITS': 'Depósitos Conciliados',
    'SHORT_DEPOSITS': 'Faltantes',
    'OVER_DEPOSITS': 'Sobrantes',
    'PENDING_DEPOSITS': 'Pendientes',
    'TOTAL_VARIANCE': 'Monto Total de la Diferencia',
    'TOTAL_EXPECTED': 'Monto Esperado Total',
    'TOTAL_ACTUAL': 'Monto Real Contado',
    'COUNTED': 'Contados',
    'OF_TOTAL': 'de',

    // Search & Filters
    'SEARCH_FILTERS': 'Búsqueda y Filtros',
    'DEPOSIT_NUMBER': 'Número de Depósito',
    'STORE_NUMBER': 'Número de Tienda',
    'STATUS': 'Estado',
    'ALL_STATUSES': 'Todos los Estados',
    'DATE_FROM': 'Fecha Desde',
    'DATE_TO': 'Fecha Hasta',
    'SEARCH_BTN': 'Buscar',
    'CLEAR_BTN': 'Limpiar',

    // Statuses
    'STATUS_PENDING': 'Pendiente',
    'STATUS_RECONCILED': 'Conciliado',
    'STATUS_OVER': 'Sobrante',
    'STATUS_SHORT': 'Faltante',

    // Table
    'DEPOSITS_TABLE_TITLE': 'Registro de Depósitos en Bóveda',
    'TABLE_DEPOSIT_NO': 'Número de Depósito',
    'TABLE_STORE_NO': 'Número de Tienda',
    'TABLE_DATE': 'Fecha de Depósito',
    'TABLE_EXPECTED': 'Monto Esperado',
    'TABLE_ACTUAL': 'Monto Real',
    'TABLE_VARIANCE': 'Diferencia',
    'TABLE_STATUS': 'Estado',
    'TABLE_ACTIONS': 'Acciones',
    'NOT_COUNTED': 'Sin conteo',
    'RECONCILE_BTN': 'Conciliar',
    'RE_RECONCILE_BTN': 'Re-conciliar',
    'NO_DEPOSITS_FOUND': 'No se encontraron depósitos con los filtros aplicados.',
    'SHOWING_RESULTS': 'Mostrando',
    'RESULTS': 'depósito(s)',

    // Create Modal
    'CREATE_MODAL_TITLE': 'Registro de Depósito',
    'CREATE_MODAL_SUBTITLE': 'Ingreso de bolsa de efectivo enviada por la tienda.',
    'FIELD_DEPOSIT_NUMBER': 'Número de Depósito',
    'FIELD_STORE_NUMBER': 'Número de Tienda',
    'FIELD_EXPECTED_AMOUNT': 'Monto Esperado',
    'FIELD_DEPOSIT_DATE': 'Fecha de Depósito',
    'SAVE_BTN': 'Guardar',
    'CANCEL_BTN': 'Cancelar',
    'ERR_DEPOSIT_NO_REQUIRED': 'El número de depósito es requerido.',
    'ERR_STORE_NO_REQUIRED': 'El número de tienda es requerido.',
    'ERR_EXPECTED_REQUIRED': 'El monto esperado debe ser mayor que 0.',
    'ERR_DATE_REQUIRED': 'La fecha de depósito es requerida.',

    // Reconcile Modal
    'RECONCILE_MODAL_TITLE': 'Conteo de Efectivo y Conciliación',
    'RECONCILE_MODAL_SUBTITLE': 'Registre el monto real contado en la bóveda para calcular la varianza y clasificar el depósito.',
    'DEPOSIT_INFO': 'Información del Depósito',
    'FIELD_ACTUAL_AMOUNT': 'Monto Real Contado',
    'CALCULATED_VARIANCE': 'Diferencia (Varianza)',
    'PREDICTED_STATUS': 'Resultado de Conciliación',
    'CONFIRM_RECONCILE_BTN': 'Guardar Conciliación',
    'ERR_ACTUAL_REQUIRED': 'El monto real contado es requerido.',
    'ERR_ACTUAL_NEGATIVE': 'El monto real no puede ser un valor negativo.',
    'VARIANCE_EXPLANATION_EXACT': 'Diferencia = 0: El monto coincide exactamente con el valor esperado.',
    'VARIANCE_EXPLANATION_OVER': 'Diferencia > 0: Existe un sobrante de efectivo en la bolsa.',
    'VARIANCE_EXPLANATION_SHORT': 'Diferencia < 0: Existe un faltante de efectivo en la bolsa.',

    // Feedback messages
    'SUCCESS_CREATED': 'Depósito registrado correctamente.',
    'SUCCESS_RECONCILED': 'Depósito conciliado exitosamente.',
    'ERROR_GENERIC': 'Ocurrió un error. Por favor intente nuevamente.',
    'LOADING': 'Cargando información...',
    'CLOSE': 'Cerrar'
  },
  en: {
    // Header & Brand
    'APP_TITLE': 'Cash Vault - Reconciliation Portal',
    'APP_SUBTITLE': 'Store deposit bag intake and cash reconciliation management',
    'LANGUAGE': 'Language',
    'LANG_ES': 'Spanish',
    'LANG_EN': 'English',
    'NEW_DEPOSIT_BTN': 'Register Deposit',
    'REFRESH': 'Refresh',

    // Dashboard KPIs
    'DASHBOARD_TITLE': 'Dashboard',
    'TOTAL_DEPOSITS': 'Total Deposits',
    'RECONCILED_DEPOSITS': 'Reconciled Deposits',
    'SHORT_DEPOSITS': 'Shortages',
    'OVER_DEPOSITS': 'Overages',
    'PENDING_DEPOSITS': 'Pending',
    'TOTAL_VARIANCE': 'Total Variance Amount',
    'TOTAL_EXPECTED': 'Total Expected Amount',
    'TOTAL_ACTUAL': 'Total Counted Amount',
    'COUNTED': 'Counted',
    'OF_TOTAL': 'of',

    // Search & Filters
    'SEARCH_FILTERS': 'Search & Filters',
    'DEPOSIT_NUMBER': 'Deposit Number',
    'STORE_NUMBER': 'Store Number',
    'STATUS': 'Status',
    'ALL_STATUSES': 'All Statuses',
    'DATE_FROM': 'Date From',
    'DATE_TO': 'Date To',
    'SEARCH_BTN': 'Search',
    'CLEAR_BTN': 'Clear',

    // Statuses
    'STATUS_PENDING': 'Pending',
    'STATUS_RECONCILED': 'Reconciled',
    'STATUS_OVER': 'Over',
    'STATUS_SHORT': 'Short',

    // Table
    'DEPOSITS_TABLE_TITLE': 'Vault Deposit Registry',
    'TABLE_DEPOSIT_NO': 'Deposit Number',
    'TABLE_STORE_NO': 'Store Number',
    'TABLE_DATE': 'Deposit Date',
    'TABLE_EXPECTED': 'Expected Amount',
    'TABLE_ACTUAL': 'Actual Amount',
    'TABLE_VARIANCE': 'Variance',
    'TABLE_STATUS': 'Status',
    'TABLE_ACTIONS': 'Actions',
    'NOT_COUNTED': 'Not counted',
    'RECONCILE_BTN': 'Reconcile',
    'RE_RECONCILE_BTN': 'Re-reconcile',
    'NO_DEPOSITS_FOUND': 'No deposits found matching the current filters.',
    'SHOWING_RESULTS': 'Showing',
    'RESULTS': 'deposit(s)',

    // Create Modal
    'CREATE_MODAL_TITLE': 'Register Deposit',
    'CREATE_MODAL_SUBTITLE': 'Intake entry for deposit bag dispatched by store.',
    'FIELD_DEPOSIT_NUMBER': 'Deposit Number',
    'FIELD_STORE_NUMBER': 'Store Number',
    'FIELD_EXPECTED_AMOUNT': 'Expected Amount',
    'FIELD_DEPOSIT_DATE': 'Deposit Date',
    'SAVE_BTN': 'Save',
    'CANCEL_BTN': 'Cancel',
    'ERR_DEPOSIT_NO_REQUIRED': 'Deposit number is required.',
    'ERR_STORE_NO_REQUIRED': 'Store number is required.',
    'ERR_EXPECTED_REQUIRED': 'Expected amount must be greater than 0.',
    'ERR_DATE_REQUIRED': 'Deposit date is required.',

    // Reconcile Modal
    'RECONCILE_MODAL_TITLE': 'Cash Count & Reconciliation',
    'RECONCILE_MODAL_SUBTITLE': 'Enter the actual cash amount counted in the vault to calculate variance and classify deposit.',
    'DEPOSIT_INFO': 'Deposit Information',
    'FIELD_ACTUAL_AMOUNT': 'Counted Actual Amount',
    'CALCULATED_VARIANCE': 'Difference (Variance)',
    'PREDICTED_STATUS': 'Reconciliation Outcome',
    'CONFIRM_RECONCILE_BTN': 'Save Reconciliation',
    'ERR_ACTUAL_REQUIRED': 'Counted actual amount is required.',
    'ERR_ACTUAL_NEGATIVE': 'Actual amount cannot be negative.',
    'VARIANCE_EXPLANATION_EXACT': 'Difference = 0: Amount matches expected value exactly.',
    'VARIANCE_EXPLANATION_OVER': 'Difference > 0: Cash overage detected in bag.',
    'VARIANCE_EXPLANATION_SHORT': 'Difference < 0: Cash shortage detected in bag.',

    // Feedback messages
    'SUCCESS_CREATED': 'Deposit registered successfully.',
    'SUCCESS_RECONCILED': 'Deposit reconciled successfully.',
    'ERROR_GENERIC': 'An error occurred. Please try again.',
    'LOADING': 'Loading information...',
    'CLOSE': 'Close'
  }
};
