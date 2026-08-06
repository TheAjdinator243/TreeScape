/**
 * العربية — arapski.
 *
 * Piše se zdesna nalijevo; smjer stranice postavlja `directionOf` iz
 * `config.ts`, a ne pojedina komponenta.
 */

import type { Dictionary } from '../dictionary';
import { count, plural } from '../plural';

export const ar: Dictionary = {
  site: {
    name: 'TreeScape',
    tagline: 'فيلا في أحضان الغابة',
    description:
      'TreeScape فيلا تحيط بها الغابة — هدوء وطبيعة وكل وسائل الراحة المنزلية. تحقّق من المواعيد المتاحة واحجز عبر الإنترنت.',
    keywords: [
      'TreeScape',
      'فيلا',
      'بيت عطلات',
      'إقامة',
      'تأجير منزل',
      'عطلة في الطبيعة',
      'حجز',
      'البوسنة والهرسك',
    ],
  },

  language: {
    label: 'اللغة',
    names: { bs: 'Bosanski', en: 'English', ar: 'العربية' },
    gateTitle: 'اختر لغتك',
    gateLead: 'بأي لغة تريد تصفّح الموقع؟',
    gateAria: 'اختر لغتك: Bosanski، English، العربية',
  },

  nav: {
    about: 'عن المنزل',
    gallery: 'الصور',
    amenities: 'المرافق',
    location: 'الموقع',
    faq: 'الأسئلة',
    book: 'احجز الآن',
    menu: 'القائمة',
    close: 'إغلاق',
    skipToBooking: 'تخطَّ إلى الحجز',
    mainNav: 'القائمة الرئيسية',
  },

  hero: {
    eyebrow: 'فيلا خاصة للعطلات',
    title: 'TreeScape',
    subtitle: 'استيقظ على صوت الغابة، لا على صوت المدينة.',
    cta: 'تحقّق من التوفر',
    scroll: 'اعرف المزيد',
    imageAlt: 'فيلا TreeScape',
  },

  about: {
    heading: 'أهلًا بك في TreeScape',
    lead: 'منزل مختبئ بين الأشجار، قريب بما يكفي للوصول إليه بسهولة، وبعيد بما يكفي لترتاح أخيرًا.',
    body: [
      'TreeScape فيلا عائلية تحيط بها أشجار الغابة العالية، ولها شرفة واسعة تطل على الوادي. في الداخل كل ما تحتاجه لإقامة طويلة — مطبخ مجهّز بالكامل، وغرفة معيشة دافئة بمدفأة، وغرف نوم تنام فيها فعلًا.',
      'مثالية لعطلة عائلية، أو هروب مع الأصدقاء في نهاية الأسبوع، أو أسبوع هادئ من العمل وسط الطبيعة. في الصيف شواء وأمسيات طويلة على الشرفة، وفي الشتاء ثلج ونار في المدفأة.',
    ],
    imageAlt: 'فيلا TreeScape من الخارج',
    stats: {
      guests: 'ضيوف',
      bedrooms: 'غرفتا نوم',
      bathrooms: 'حمّامان',
    },
  },

  gallery: {
    heading: 'معرض الصور',
    lead: 'شاهد كيف تبدو عطلتك القادمة.',
    open: 'افتح الصورة',
    prev: 'الصورة السابقة',
    next: 'الصورة التالية',
    close: 'أغلق المعرض',
    counter: (index, total) => `${index} / ${total}`,
    itemAlt: (n) => `صورة ${n}`,
    itemCaption: (n) => `صورة ${n}`,
  },

  amenities: {
    heading: 'ما ينتظرك',
    lead: 'كل شيء موجود بالفعل — لا تحمل معك سوى حقيبتك.',
    items: {
      pool: { label: 'مسبح', note: 'مُدفّأ بمضخة حرارية' },
      jacuzzi: { label: 'جاكوزي', note: 'ماء ساخن ونفّاثات تدليك' },
      fountain: { label: 'نافورة', note: 'في الفناء، بجوار مكان الجلوس' },
      wifi: { label: 'إنترنت', note: 'واي فاي في المنزل كله' },
      kitchen: { label: 'مطبخ مجهّز', note: 'كل الأواني والأجهزة' },
      fire: { label: 'مدفأة حطب', note: 'الحطب متوفر' },
      grill: { label: 'شواية وأثاث حديقة', note: 'لأمسيات الصيف الطويلة' },
      car: { label: 'موقف مجاني', note: 'يتسع لثلاث سيارات في الفناء' },
      heat: { label: 'تدفئة مركزية', note: 'دفء في عزّ الشتاء' },
      washer: { label: 'غسالة ملابس', note: 'ومجفّف أيضًا' },
      tv: { label: 'تلفزيون ذكي', note: 'نتفليكس وقنوات محلية' },
      pet: { label: 'الحيوانات الأليفة مرحّب بها', note: 'بإخطار مسبق' },
      tree: { label: 'حديقة واسعة', note: '2000 م² من الأرض المسوّرة' },
      coffee: { label: 'آلة قهوة', note: 'قهوة تركية وإسبريسو' },
      towel: { label: 'مفارش ومناشف', note: 'مشمولة في السعر' },
    },
  },

  location: {
    heading: 'أين نحن',
    lead: 'قريب بما يكفي للوصول بسهولة، وبعيد بما يكفي لئلا تسمع سوى الغابة.',
    directions: 'نرسل العنوان الدقيق وإرشادات الوصول بعد تأكيد الحجز.',
    mapTitle: 'خريطة موقع فيلا TreeScape',
    driveTime: (minutes) => `${minutes} دقيقة بالسيارة`,
    places: {
      city: 'سراييفو',
      airport: 'المطار',
      shop: 'أقرب متجر',
      ski: 'منتجع التزلج',
    },
  },

  faq: {
    heading: 'الأسئلة الشائعة',
    lead: 'إن كان أي شيء غير واضح، لا تتردد في التواصل معنا.',
    items: ({ checkinTime, checkoutTime, maxGuests }) => [
      {
        q: 'متى يمكنني الوصول ومتى يجب أن أغادر؟',
        a: `تسجيل الدخول من الساعة ${checkinTime}، وتسجيل المغادرة حتى الساعة ${checkoutTime}. إن كنت تحتاج وصولًا أبكر أو مغادرة متأخّرة، أخبرنا — يمكن الاتفاق على ذلك عادةً.`,
      },
      {
        q: 'كيف يتم الحجز؟',
        a: 'تختار المواعيد وترسل الحجز. نحجز لك المواعيد فورًا وتظهر للضيوف الآخرين على أنها محجوزة. لا يصبح الحجز نهائيًا إلا بعد موافقة المضيف — ونخبرك بذلك عبر البريد الإلكتروني.',
      },
      {
        q: 'هل يمكنني إلغاء الحجز؟',
        a: 'تواصل معنا في أسرع وقت عبر البريد الإلكتروني أو الهاتف الموجود في أسفل الصفحة. تعتمد شروط الاسترداد على المدة المتبقية حتى موعد الوصول.',
      },
      {
        q: 'هل الحيوانات الأليفة مسموح بها؟',
        a: 'نعم، بإخطار مسبق — يرجى ذكر ذلك في خانة الملاحظات عند الحجز حتى نهيّئ المنزل.',
      },
      {
        q: 'هل المفارش مشمولة؟',
        a: 'نعم. المفارش والمناشف ومستلزمات النظافة الأساسية مشمولة في السعر — من دون أي رسوم إضافية.',
      },
      {
        q: 'كم شخصًا يتسع المنزل؟',
        a: `يتسع المنزل حتى ${maxGuests} أشخاص. للمجموعات الأكبر، تواصل معنا قبل الحجز.`,
      },
      {
        q: 'هل يوجد إنترنت وتغطية للهاتف المحمول؟',
        a: 'نعم — الواي فاي يغطي المنزل كله، وإشارة الهاتف المحمول مستقرة.',
      },
      {
        q: 'كيف أحصل على العنوان والمفتاح؟',
        a: 'بعد تأكيد الحجز نرسل لك بريدًا إلكترونيًا يتضمن العنوان الدقيق وإرشادات الوصول ورقم هاتف المضيف، وهو من يستقبلك ويسلّمك المفتاح.',
      },
    ],
  },

  booking: {
    heading: 'احجز موعدك',
    lead: 'انقر على تاريخ واحد لإقامة نهارية بلا مبيت، أو على تاريخين لإقامة أطول. المواعيد المحجوزة تظهر بالرمادي ولا يمكن اختيارها.',

    pickDates: 'اختر التواريخ',
    checkIn: 'الوصول',
    checkOut: 'المغادرة',
    notSelected: 'لم يُحدَّد',
    clearDates: 'إلغاء الاختيار',

    legendFree: 'متاح',
    legendTaken: 'محجوز',
    legendSelected: 'اختيارك',

    guests: 'عدد الضيوف',
    name: 'الاسم الكامل',
    namePlaceholder: 'اسمك الكامل',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'you@email.com',
    phone: 'رقم الهاتف',
    phonePlaceholder: '+387 6x xxx xxx',
    note: 'ملاحظة للمضيف',
    notePlaceholder: 'هل تصطحب حيوانًا أليفًا؟ هل ستصل متأخرًا؟ أخبرنا هنا.',
    optional: 'اختياري',

    summaryTitle: 'ملخّص الحجز',
    daysLabel: (n) => count('ar', n, plural.ar.days),
    total: 'الإجمالي',
    seasonalNote: 'السعر اليومي يتغيّر حسب الموسم.',
    singleDayNote: 'حجز ليوم واحد، من دون مبيت.',

    payMethodTitle: 'طريقة الدفع',

    payTransfer: 'تحويل بنكي',
    payTransferHint:
      'تصلك بيانات الحساب ورقم مرجع الدفع. نحتفظ لك بالموعد حتى وصول التحويل.',

    payCash: 'الدفع نقدًا',
    payCashHint:
      'ترسل طلبًا إلى المضيف. نحتفظ لك بالموعد حتى يؤكّده المضيف — عادةً في اليوم نفسه.',

    payTest: 'حجز تجريبي',
    payTestHint:
      'للتجربة فقط — يؤكّد الحجز من دون أي دفع. لا يظهر هذا الخيار للضيوف.',

    reserve: 'احجز',
    submitting: 'لحظة من فضلك…',

    selectDatesFirst: 'اختر تاريخًا في التقويم أولًا.',
    singleDayHint: 'انقر على تاريخ واحد لإقامة نهارية، أو على تاريخ آخر لإقامة أطول.',
    unavailableRange:
      'المدة المختارة تتضمّن أيامًا محجوزة مسبقًا. اختر مدة خالية من التواريخ المحجوزة.',
  },

  confirmation: {
    pageTitle: 'حجزك',

    confirmedTitle: 'تم تأكيد حجزك',
    confirmedLead:
      'أكّد المضيف حجزك. الموعد لك، ويظهر للضيوف الآخرين على أنه محجوز.',

    pendingTitle: 'الموعد محجوز لك',
    pendingLead:
      'نحتفظ لك بالموعد، وهو يظهر للضيوف الآخرين على أنه محجوز. لا يصبح الحجز نهائيًا إلا بعد موافقة المضيف — سنراسلك عبر البريد الإلكتروني في أقرب وقت.',

    transferTitle: 'الموعد محجوز لك',
    transferLead:
      'بقي الدفع فقط. نحتفظ لك بالموعد حتى انتهاء المهلة أدناه. لا يصبح الحجز نهائيًا إلا بعد التحقق من التحويل.',

    inactiveTitle: 'هذا الحجز لم يعد ساريًا',
    inactiveLead: 'تم تحرير هذا الموعد وأصبح متاحًا للضيوف الآخرين من جديد.',

    transferHeading: 'بيانات التحويل',
    transferRecipient: 'المستفيد',
    transferBank: 'البنك',
    transferIban: 'رقم الحساب (IBAN)',
    transferReference: 'مرجع الدفع',
    transferAmount: 'المبلغ المطلوب',
    transferDeadline: 'الدفع قبل',
    transferNote:
      'يرجى كتابة مرجع الدفع — به يتعرّف المضيف على تحويلك. إن لم يصل المبلغ قبل الموعد المحدد، يُحرَّر الحجز.',
    copy: 'نسخ',
    copied: 'تم النسخ',

    pendingBadge: 'محجوز — بانتظار التأكيد',
    awaitingTransfer: 'محجوز — بانتظار الدفع',
    confirmedBadge: 'مؤكَّد',
    heldNote: 'الموعد محجوز لك بالفعل — لا يمكن لأحد آخر أخذه في هذه الأثناء.',
    reference: 'رقم الحجز',
    stay: 'إقامتك',
    guestsLabel: 'الضيوف',
    totalLabel: 'المبلغ الإجمالي',
    payOnArrival: 'يُدفع المبلغ نقدًا عند الوصول.',
    paid: 'تم استلام الدفعة.',
    testBooking: 'هذا حجز تجريبي — لم يُخصم أي مبلغ.',
    whatNext: 'ماذا بعد؟',
    whatNextBody:
      'أرسلنا إليك بريدًا إلكترونيًا بالتفاصيل. ستصلك قبل الوصول العنوان الدقيق وإرشادات الوصول وبيانات التواصل مع المضيف.',
    backHome: 'العودة إلى الصفحة الرئيسية',
  },

  errors: {
    DATES_TAKEN: 'حُجزت هذه التواريخ للتو. يرجى اختيار غيرها.',
    INVALID_RANGE: 'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.',
    PAST_DATE: 'لا يمكنك الحجز في تاريخ مضى.',
    MAX_DAYS: (n) => `أقصى مدة إقامة هي ${count('ar', n, plural.ar.days)}.`,
    TOO_MANY_GUESTS: (n) => `الحد الأقصى هو ${count('ar', n, plural.ar.guests)}.`,
    INVALID_INPUT: 'تحقّق من البيانات المُدخلة وحاول مرة أخرى.',
    REQUIRED_NAME: 'أدخل اسمك الكامل.',
    REQUIRED_EMAIL: 'أدخل بريدًا إلكترونيًا صحيحًا.',
    REQUIRED_PHONE: 'أدخل رقم هاتف.',
    REQUIRED_METHOD: 'اختر طريقة الدفع.',
    METHOD_UNAVAILABLE: 'طريقة الدفع المختارة غير متاحة حاليًا.',
    SERVER_ERROR: 'حدث خطأ ما. حاول مرة أخرى بعد قليل.',
    NOT_ALLOWED: 'غير مسموح.',
    MAX_BELOW_MIN: 'لا يمكن أن يكون الحد الأقصى للأيام أقل من الحد الأدنى.',
    ALREADY_RESOLVED: 'تمت معالجة هذا الطلب مسبقًا. حدّث الصفحة.',
    DATABASE_MISSING:
      'قاعدة البيانات غير مهيّأة. أضف مفاتيح Supabase إلى ‎.env.local‎ (أو إلى Vercel → Environment Variables) وشغّل الترحيلات من supabase/migrations.',
    ADMIN_MISSING: 'لوحة الإدارة غير مهيّأة — ‎ADMIN_ACCESS_CODE‎ و‎ADMIN_SESSION_SECRET‎ مفقودان.',
  },

  admin: {
    gateTitle: 'إدارة TreeScape',
    gateLead: 'أدخل رمز الدخول.',
    gateCode: 'رمز الدخول',
    gateSubmit: 'فتح',
    gateWrong: 'رمز خاطئ.',
    gateLocked: 'محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.',
    gateNotConfigured:
      'لوحة الإدارة غير مهيّأة. اضبط ‎ADMIN_ACCESS_CODE‎ و‎ADMIN_SESSION_SECRET‎ في ‎.env.local‎.',
    databaseNotConfigured:
      'قاعدة البيانات غير مهيّأة، فلا يوجد ما يُعرض. أضف مفاتيح Supabase إلى ‎.env.local‎ وشغّل الترحيلات من supabase/migrations.',

    logout: 'تسجيل الخروج',
    title: 'الإدارة',

    tabRequests: 'الطلبات',
    tabBookings: 'الحجوزات',
    tabCalendar: 'التقويم',
    tabPricing: 'الأسعار',

    requestsHeading: 'طلبات الدفع نقدًا',
    requestsEmpty: 'لا توجد طلبات تنتظر الموافقة حاليًا.',
    approve: 'موافقة',
    reject: 'رفض',
    approveConfirm: 'تأكيد هذا الحجز؟',
    rejectConfirm: 'رفض هذا الطلب؟ سيُحرَّر الموعد.',
    receivedAt: (when) => `ورد بتاريخ ${when}`,
    byCash: 'نقدًا',
    byTransfer: 'تحويل بنكي',

    bookingsHeading: 'كل الحجوزات',
    bookingsEmpty: 'لا توجد أي حجوزات بعد.',
    colStay: 'الموعد',
    colGuest: 'الضيف',
    colMethod: 'الطريقة',
    colStatus: 'الحالة',
    colAmount: 'المبلغ',
    cancel: 'إلغاء',
    cancelConfirm: 'إلغاء هذا الحجز؟',

    calendarHeading: 'حجب المواعيد',
    calendarLead: 'اختر مدة التواريخ التي تريد إغلاقها أمام الضيوف (صيانة، إقامة شخصية…).',
    blockReason: 'السبب (داخلي)',
    blockReasonPlaceholder: 'مثلًا: دهان',
    blockSubmit: 'احجب الموعد',
    blockedHeading: 'المواعيد المحجوبة',
    blockedEmpty: 'لا توجد مواعيد محجوبة.',
    unblock: 'تحرير',
    unblockConfirm: 'تحرير هذا الموعد؟',

    pricingHeading: 'الأسعار الأساسية',
    pricingLead: 'تسري على كل تاريخ لا ينتمي إلى أي موسم.',
    defaultNightly: 'السعر الأساسي لليوم',
    maxNights: 'الحد الأقصى لعدد الأيام',
    maxGuests: 'الحد الأقصى لعدد الضيوف',
    holdMinutes: 'مدة حجز الموعد أثناء الدفع (دقيقة)',
    checkinFrom: 'تسجيل الدخول من',
    checkoutBy: 'تسجيل المغادرة حتى',
    currency: 'العملة (EUR، BAM…)',
    currencySymbol: 'الرمز (€، KM…)',
    save: 'حفظ',
    saved: 'تم الحفظ.',

    seasonsHeading: 'أسعار المواسم',
    seasonsLead:
      'إذا تداخل موسمان، يسري الموسم صاحب الأولوية الأعلى. يوم المغادرة لا يُحتسب.',
    seasonName: 'اسم الموسم',
    seasonNamePlaceholder: 'مثلًا: موسم صيف 2027',
    seasonFrom: 'من',
    seasonTo: 'إلى',
    seasonToHint: 'غير مشمول',
    seasonPeriod: 'المدة',
    seasonPrice: 'السعر لليوم',
    seasonPriority: 'الأولوية',
    seasonAdd: 'أضف موسمًا',
    seasonDelete: 'حذف',
    seasonDeleteConfirm: 'حذف هذا الموسم؟',
    seasonsEmpty: 'لا مواسم معرَّفة — يسري السعر الأساسي في كل مكان.',

    statusLabels: {
      pending_payment: 'بانتظار الدفع',
      pending_cash: 'بانتظار الموافقة',
      pending_transfer: 'بانتظار التحويل البنكي',
      confirmed: 'مؤكَّد',
      expired: 'منتهٍ',
      cancelled: 'ملغى',
      blocked: 'محجوب',
    },

    methodLabels: {
      card: 'بطاقة',
      cash: 'نقدًا',
      bank_transfer: 'تحويل بنكي',
      test: 'تجريبي',
      none: '—',
    },

    markPaid: 'وصلت الدفعة',
    markPaidConfirm: 'تأكيد وصول المبلغ إلى الحساب؟',
    transfersHeading: 'تحويلات بنكية قيد الانتظار',
    transfersEmpty: 'لا توجد حجوزات تنتظر تحويلًا.',
    transferRef: 'مرجع الدفع',
    deadlineAt: 'المهلة',

    bankHeading: 'بيانات التحويل البنكي',
    bankLead:
      'هذا ما يراه الضيف عند اختياره التحويل البنكي. ما دام حقل IBAN فارغًا، لا يُعرض هذا الخيار إطلاقًا.',
    bankAccountName: 'اسم المستفيد',
    bankAccountNamePlaceholder: 'الاسم الكامل أو اسم الشركة',
    bankName: 'اسم البنك',
    bankNamePlaceholder: 'مثلًا: Raiffeisen Bank d.d. BiH',
    bankIban: 'IBAN / رقم الحساب',
    bankIbanPlaceholder: 'BA39 1234 5678 9012 3456',
    bankIbanHint: 'اتركه فارغًا كي لا يُعرض التحويل البنكي للضيوف إطلاقًا.',
    transferDays: 'مهلة الدفع (أيام)',
  },

  common: {
    from: 'من',
    day: 'يوم',
    loading: 'جارٍ التحميل…',
    tryAgain: 'حاول مرة أخرى',
    days: plural.ar.days,
    guests: plural.ar.guests,
  },

  footer: {
    contact: 'اتصل بنا',
    quickLinks: 'روابط سريعة',
    rights: 'جميع الحقوق محفوظة.',
    address: 'البوسنة والهرسك',
  },

  email: {
    greeting: (name) => (name ? `عزيزي/عزيزتي ${name}،` : 'مرحبًا،'),
    rowStay: 'الموعد',
    rowGuests: 'الضيوف',
    rowAmount: 'المبلغ',
    rowReference: 'رقم الحجز',
    rowGuest: 'الضيف',
    rowEmail: 'البريد الإلكتروني',
    rowPhone: 'الهاتف',
    rowNote: 'ملاحظة الضيف',

    addressLater:
      'سنرسل قبل وصولك العنوان الدقيق وإرشادات الوصول وبيانات التواصل مع المضيف.',
    payOnArrival: 'يُدفع المبلغ نقدًا عند الوصول.',

    confirmedSubject: 'تم تأكيد الحجز',
    confirmedTitle: 'تم تأكيد حجزك',
    confirmedBody: 'شكرًا لحجزك. الموعد مثبَّت ومدفوع.',

    transferSubject: 'بيانات التحويل',
    transferTitle: 'الموعد محجوز — بقي الدفع',
    transferBody:
      'نحتفظ لك بالموعد. يرجى تحويل المبلغ وفق البيانات أدناه — وبمجرد وصول التحويل يصبح الحجز مؤكَّدًا.',
    transferHeading: 'بيانات التحويل',
    transferRecipient: 'المستفيد',
    transferBank: 'البنك',
    transferIban: 'IBAN',
    transferReference: 'مرجع الدفع',
    transferAmount: 'المبلغ',
    transferDeadline: 'الدفع قبل',
    transferWarning:
      'يرجى كتابة مرجع الدفع — به يتعرّف المضيف على تحويلك. إن لم يصل المبلغ قبل الموعد المحدد، يُحرَّر الحجز.',

    cashRequestSubject: 'تم استلام الطلب',
    cashRequestTitle: 'تم استلام طلب الحجز',
    cashRequestBody:
      'استلمنا طلبك. نحتفظ لك بالموعد حتى يؤكّده المضيف — وسنتواصل معك في أقرب وقت.',

    cashApprovedSubject: 'تم تأكيد الحجز',
    cashApprovedTitle: 'أكّد المضيف حجزك',
    cashApprovedBody: 'الموعد لك. نراك قريبًا!',

    cashRejectedSubject: 'لم يتم تأكيد الحجز',
    cashRejectedTitle: 'للأسف، الموعد غير متاح',
    cashRejectedBody:
      'لم يتمكّن المضيف من تأكيد الموعد المطلوب. تم تحرير الموعد، فلا تتردد في اختيار موعد آخر.',

    ownerCashTitle: 'طلب جديد للدفع نقدًا',
    ownerTransferTitle: 'حجز جديد — بانتظار التحويل البنكي',
    ownerCardTitle: 'حجز مدفوع جديد',
    ownerCashHint: 'الموعد محجوز وغير ظاهر للضيوف الآخرين حتى تتخذ قرارك.',
    ownerTransferHint: 'الموعد محجوز. عند وصول المبلغ إلى الحساب، أكّده في لوحة الإدارة.',
    ownerOpenAdmin: 'افتح لوحة الإدارة',
  },
};
