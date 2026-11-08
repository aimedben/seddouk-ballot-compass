export type Language = 'fr' | 'ar';

export interface Translations {
  appName: string;
  commune: string;
  wilaya: string;
  welcomeTo: string;
  startDate: string;
  welcomeSubtitle: string;
  startBtn: string;
  adminPortal: string;
  backHome: string;
  
  // Lists
  allListsTitle: string;
  allListsSubtitle: string;
  listNumber: string;
  candidatesCount: string;
  chooseList: string;
  selectedList: string;
  
  // Results
  resultsTitle: string;
  resultsSubtitle: string;
  tabAll: string;
  statusProvisional: string;
  statusDefinitive: string;
  statusInProgress: string;
  statusUnavailable: string;
  resultsDisabledMessage: string;
  totalValidBallots: string;
  totalLists: string;
  firstPlaceBadge: string;
  votesCount: string;
  percentValid: string;
  candidateRanking: string;
  rank: string;
  positionNumber: string;
  ballotsWithCandidate: string;

  // Vote process
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  selectCandidatesTitle: string;
  selectCandidatesDesc: string;
  selectedCounter: string;
  maxCandidatesAlert: string;
  voteBtn: string;
  mustSelectAtLeastOne: string;

  // Confirmation
  confirmTitle: string;
  confirmSubtitle: string;
  chosenParty: string;
  selectedCandidatesList: string;
  confirmVoteBtn: string;
  modifyChoiceBtn: string;
  submittingVote: string;

  // Success
  successTitle: string;
  successSubtitle: string;
  successNotice: string;
  viewResultsBtn: string;

  // IP Blocked
  alreadyVotedTitle: string;
  alreadyVotedMessage: string;

  // Admin
  adminTitle: string;
  adminLogin: string;
  username: string;
  password: string;
  loginBtn: string;
  logoutBtn: string;
  dashboard: string;
  manageParties: string;
  manageCandidates: string;
  manageVotesResults: string;
  security: string;
  auditHistory: string;
  settings: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    appName: 'SEDDOUK ELECTIONS 2026',
    commune: 'Commune de Seddouk',
    wilaya: 'Wilaya de Béjaïa',
    welcomeTo: 'BIENVENUE SUR SEDDOUK ELECTIONS 2026',
    startDate: '28 NOVEMBRE 2026',
    welcomeSubtitle: 'Consultation électorale citoyenne pour l\'Assemblée Populaire Communale (APC)',
    startBtn: 'COMMENCER',
    adminPortal: 'Administration',
    backHome: 'Retour à l\'accueil',

    allListsTitle: 'LES 4 LISTES CANDIDATES',
    allListsSubtitle: 'Sélectionnez une liste pour découvrir ses candidats et participer au scrutin',
    listNumber: 'Liste N°',
    candidatesCount: 'candidats',
    chooseList: 'CHOISIR CETTE LISTE',
    selectedList: 'Liste sélectionnée',

    resultsTitle: 'RÉSULTATS & CLASSEMENT',
    resultsSubtitle: 'Dépouillement en direct et statistiques certifiées de la consultation',
    tabAll: 'TOUTES LES LISTES',
    statusProvisional: 'Résultats Provisoires',
    statusDefinitive: 'Résultats Définitifs',
    statusInProgress: 'Dépouillement en cours',
    statusUnavailable: 'Non disponible',
    resultsDisabledMessage: 'La publication des résultats est momentanément suspendue par l\'administration.',
    totalValidBallots: 'Total des bulletins valides',
    totalLists: 'Listes participantes',
    firstPlaceBadge: '1er au classement',
    votesCount: 'voix / bulletins',
    percentValid: 'des suffrages exprimés',
    candidateRanking: 'Classement interne des candidats',
    rank: 'Rang',
    positionNumber: 'N° ordre',
    ballotsWithCandidate: 'des bulletins de la liste',

    step1: '1. Choix de liste',
    step2: '2. Choix candidats',
    step3: '3. Confirmation',
    step4: '4. Enregistrement',
    selectCandidatesTitle: 'Sélectionnez vos candidats',
    selectCandidatesDesc: 'Vous pouvez sélectionner entre 1 et 10 candidats maximum sur cette liste.',
    selectedCounter: 'CANDIDATS SÉLECTIONNÉS',
    maxCandidatesAlert: 'Limite maximale de 10 candidats atteinte.',
    voteBtn: 'VALIDER MON CHOIX',
    mustSelectAtLeastOne: 'Veuillez sélectionner au moins 1 candidat pour continuer.',

    confirmTitle: 'Vérification de votre vote',
    confirmSubtitle: 'Veuillez examiner attentivement votre sélection avant confirmation définitive.',
    chosenParty: 'Liste choisie',
    selectedCandidatesList: 'Candidats choisis',
    confirmVoteBtn: 'CONFIRMER DÉFINITIVEMENT LE VOTE',
    modifyChoiceBtn: 'MODIFIER MA SÉLECTION',
    submittingVote: 'Enregistrement sécurisé du bulletin...',

    successTitle: 'VOTE ENREGISTRÉ',
    successSubtitle: 'MERCI BEAUCOUP POUR VOTRE PARTICIPATION CITOYENNE',
    successNotice: 'Votre bulletin a été sécurisé et pris en compte dans le décompte officiel.',
    viewResultsBtn: 'CONSULTER LES RÉSULTATS',

    alreadyVotedTitle: 'Participation déjà enregistrée',
    alreadyVotedMessage: 'Vous avez déjà participé au vote. Un seul vote est autorisé par adresse IP. Merci de votre compréhension.',

    adminTitle: 'ESPACE ADMINISTRATION',
    adminLogin: 'Connexion sécurisée',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    loginBtn: 'SE CONNECTER',
    logoutBtn: 'Déconnexion',
    dashboard: 'Tableau de bord',
    manageParties: 'Gestion des listes',
    manageCandidates: 'Gestion des candidats',
    manageVotesResults: 'Résultats & Votes',
    security: 'Sécurité des votes',
    auditHistory: 'Journal d\'audit',
    settings: 'Paramètres',
  },
  ar: {
    appName: 'انتخابات صدوق 2026',
    commune: 'بلدية صدوق',
    wilaya: 'ولاية بجاية',
    welcomeTo: 'مرحباً بكم في انتخابات صدوق 2026',
    startDate: '28 نوفمبر 2026',
    welcomeSubtitle: 'المنصة الرسمية للاستحقاق الانتخابي للمجلس الشعبي البلدي',
    startBtn: 'ابدأ المشاركة',
    adminPortal: 'فضاء الإدارة',
    backHome: 'العودة للرئيسية',

    allListsTitle: 'القوائم الأربعة المترشحة',
    allListsSubtitle: 'اختر قائمة للاطلاع على مترشحيها والمشاركة في التصويت',
    listNumber: 'قائمة رقم',
    candidatesCount: 'مترشحين',
    chooseList: 'اختيار هذه القائمة',
    selectedList: 'القائمة المختارة',

    resultsTitle: 'النتائج والترتيب العام',
    resultsSubtitle: 'فرز الأصوات المباشر والإحصائيات المعتمدة للعملية الانتخابية',
    tabAll: 'جميع القوائم',
    statusProvisional: 'نتائج مؤقتة',
    statusDefinitive: 'نتائج نهائية',
    statusInProgress: 'الفرز جارٍ',
    statusUnavailable: 'غير متوفرة',
    resultsDisabledMessage: 'نشر النتائج متوقف مؤقتاً من قبل الإدارة.',
    totalValidBallots: 'إجمالي أوراق التصويت الصحيحة',
    totalLists: 'القوائم المشاركة',
    firstPlaceBadge: 'المرتبة الأولى',
    votesCount: 'صوت / ورقة',
    percentValid: 'من الأصوات المعبر عنها',
    candidateRanking: 'ترتيب المترشحين الداخلي',
    rank: 'الرتبة',
    positionNumber: 'رقم الترتيب',
    ballotsWithCandidate: 'من أوراق هذه القائمة',

    step1: '1. اختيار القائمة',
    step2: '2. اختيار المترشحين',
    step3: '3. التأكيد',
    step4: '4. التسجيل',
    selectCandidatesTitle: 'اختر مترشحيك المفضلين',
    selectCandidatesDesc: 'يمكنك اختيار من 1 إلى 10 مترشحين كحد أقصى من هذه القائمة.',
    selectedCounter: 'المترشحين المختارين',
    maxCandidatesAlert: 'تم الوصول إلى الحد الأقصى (10 مترشحين).',
    voteBtn: 'تأكيد الاختيار',
    mustSelectAtLeastOne: 'يرجى اختيار مترشح واحد على الأقل للمتابعة.',

    confirmTitle: 'مراجعة خيارات التصويت',
    confirmSubtitle: 'يرجى التحقق بدقة من اختياراتك قبل المصادقة النهائية.',
    chosenParty: 'القائمة المختارة',
    selectedCandidatesList: 'المترشحون المختارون',
    confirmVoteBtn: 'تأكيد التصويت النهائي',
    modifyChoiceBtn: 'تعديل الاختيارات',
    submittingVote: 'جاري تسجيل ورقة التصويت بأمان...',

    successTitle: 'تم تسجيل التصويت بنجاح',
    successSubtitle: 'شكراً جزيلاً على مشاركتكم الفعالة',
    successNotice: 'تم إيداع ورقتكم في الصندوق الافتراضي واحتسابها ضمن الإحصائيات الرسمية.',
    viewResultsBtn: 'الاطلاع على النتائج',

    alreadyVotedTitle: 'مشاركة مسجلة مسبقاً',
    alreadyVotedMessage: 'لقد شاركتم بالفعل في التصويت. يُسمح بصوت واحد فقط لكل عنوان IP. شكراً لتفهمكم.',

    adminTitle: 'فضاء الإدارة والتحكم',
    adminLogin: 'تسجيل الدخول الآمن',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    loginBtn: 'تسجيل الدخول',
    logoutBtn: 'تسجيل الخروج',
    dashboard: 'لوحة القيادة',
    manageParties: 'إدارة القوائم',
    manageCandidates: 'إدارة المترشحين',
    manageVotesResults: 'النتائج والتصويت',
    security: 'أمن التصويت',
    auditHistory: 'سجل العمليات (Audit)',
    settings: 'الإعدادات العامة',
  },
};
