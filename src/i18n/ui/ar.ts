import type { UIDictionary } from './en';

/**
 * Arabic. Typed as UIDictionary, so omitting any key is a compile error.
 *
 * Western digits are kept throughout: numerals are interpolated from data, and
 * mixing Eastern Arabic digits into strings that also carry Latin units reads
 * worse than staying consistent.
 */
export const ar: UIDictionary = {
  'tab.thisWeek': 'هذا الأسبوع',
  'tab.shopping': 'التسوق',
  'tab.saved': 'المحفوظات',
  'tab.settings': 'الإعدادات',

  'slot.breakfast': 'الفطور',
  'slot.lunch': 'الغداء',
  'slot.dinner': 'العشاء',
  'slot.snack': 'وجبة خفيفة',

  'day.today': 'اليوم',
  'day.tomorrow': 'غدًا',
  'day.yesterday': 'أمس',
  'day.sunday': 'الأحد',
  'day.monday': 'الاثنين',
  'day.tuesday': 'الثلاثاء',
  'day.wednesday': 'الأربعاء',
  'day.thursday': 'الخميس',
  'day.friday': 'الجمعة',
  'day.saturday': 'السبت',
  'dayShort.sunday': 'أحد',
  'dayShort.monday': 'اثنين',
  'dayShort.tuesday': 'ثلاثاء',
  'dayShort.wednesday': 'أربعاء',
  'dayShort.thursday': 'خميس',
  'dayShort.friday': 'جمعة',
  'dayShort.saturday': 'سبت',

  'month.1': 'يناير',
  'month.2': 'فبراير',
  'month.3': 'مارس',
  'month.4': 'أبريل',
  'month.5': 'مايو',
  'month.6': 'يونيو',
  'month.7': 'يوليو',
  'month.8': 'أغسطس',
  'month.9': 'سبتمبر',
  'month.10': 'أكتوبر',
  'month.11': 'نوفمبر',
  'month.12': 'ديسمبر',

  'week.thisWeek': 'هذا الأسبوع',
  'week.nextWeek': 'الأسبوع القادم',
  'week.weekOf': 'أسبوع',
  'week.averagePerDay': 'المتوسط اليومي',
  'week.netCarbs': 'الكربوهيدرات الصافية',
  'week.kcal': '{count} سعرة',
  'week.shuffle': 'أعد ترتيب الأسبوع',
  'week.shuffleAgain': 'أعد الترتيب ({count})',
  'week.previousWeek': 'الأسبوع السابق',
  'week.nextWeekLabel': 'الأسبوع القادم',
  'week.snackOfTheWeek': 'وجبة الأسبوع الخفيفة',
  'week.netCarbsChip': '{count} غ كربوهيدرات صافية',
  'week.noticeDietIgnored':
    'لا توجد وصفات {slots} تطابق كل القيود المفعّلة، لذلك تتجاهلها {slots} هذا الأسبوع. إيقاف أحد القيود يحل المشكلة.',
  'week.noticeOverTargetOne':
    'يوم واحد يتجاوز حدك البالغ {limit} غ من الكربوهيدرات الصافية — الوصفات المطابقة لقيودك أقل من أن تبقيك تحته كل يوم.',
  'week.noticeOverTargetMany':
    '{count} أيام تتجاوز حدك البالغ {limit} غ من الكربوهيدرات الصافية — الوصفات المطابقة لقيودك أقل من أن تبقيك تحته كل يوم.',

  'macro.fat': 'دهون {count} غ',
  'macro.protein': 'بروتين {count} غ',
  'macro.netCarbs': 'كربوهيدرات صافية {count} غ',

  'card.minutes': '{count} دقيقة',
  'card.kcal': '{count} سعرة',
  'card.netCarbs': '{count} غ صافي',
  'card.a11yRecipe': '{title}، {count} غرام كربوهيدرات صافية',
  'card.save': 'احفظ الوصفة',
  'card.unsave': 'أزل من المحفوظات',
  'card.markCooked': 'علّم كمُحضَّرة',
  'card.markNotCooked': 'ألغِ علامة التحضير',

  'shopping.title': 'قائمة التسوق',
  'shopping.subtitle': '{range} · كل ما يلزم لـ {days} أيام',
  'shopping.thisWeek': 'هذا الأسبوع',
  'shopping.nextWeek': 'الأسبوع القادم',
  'shopping.progress': 'تم شراء {done} من {total}',
  'shopping.reset': 'إعادة تعيين',
  'shopping.resetLabel': 'مسح كل العلامات',
  'shopping.emptyTitle': 'لا شيء للشراء',
  'shopping.emptyBody': 'فعّل وجبة واحدة على الأقل من الإعدادات وستمتلئ القائمة تلقائيًا.',

  'aisle.produce': 'الخضار والفواكه',
  'aisle.meatSeafood': 'اللحوم والمأكولات البحرية',
  'aisle.dairyEggs': 'الألبان والبيض',
  'aisle.pantry': 'المؤن',
  'aisle.spices': 'البهارات',
  'aisle.frozen': 'المجمدات',

  'saved.title': 'المحفوظات',
  'saved.emptyHint': 'اضغط على القلب في أي وصفة لتحفظها هنا.',
  'saved.countOne': 'وصفة واحدة محفوظة',
  'saved.countMany': '{count} وصفات محفوظة',
  'saved.emptyTitle': 'لا توجد وصفات محفوظة بعد',
  'saved.emptyBody':
    'تظهر هنا الوصفات التي تضغط على قلبها في خطة الأسبوع، مرتبة حسب الوجبة، لتبقى المفضلة على بعد نقرة واحدة.',

  'settings.title': 'الإعدادات',
  'settings.subtitle': 'أي تغيير هنا يعيد ترتيب الأسبوع ليطابقه.',
  'settings.language': 'اللغة',
  'settings.languageFooter': 'تُترجم الوصفات والمكونات وخطوات التحضير أيضًا.',
  'settings.dietaryFilters': 'قيود الطعام',
  'settings.dietaryFiltersFooter': 'لا تُخطَّط إلا الوصفات المطابقة لكل قيد مفعّل.',
  'settings.dailyNetCarbs': 'الكربوهيدرات الصافية اليومية',
  'settings.dailyNetCarbsFooter':
    'تُختار الوصفات لتناسب هذا الحد على مدار اليوم. وإذا لم يتطابق عدد كافٍ منها، يُخفَّف الحد لتلك الوجبة ويوضّح الأسبوع ذلك.',
  'settings.mealsToPlan': 'الوجبات المطلوب تخطيطها',
  'settings.addSnack': 'أضف وجبة خفيفة للأسبوع',
  'settings.weekStartsOn': 'يبدأ الأسبوع يوم',
  'settings.monday': 'الاثنين',
  'settings.sunday': 'الأحد',
  'settings.weeklyReminder': 'التذكير الأسبوعي',
  'settings.reminderToggle': 'ذكّرني عند بدء أسبوع جديد',
  'settings.reminderFooter': 'إشعار محلي — لا شيء يغادر الجهاز.',
  'settings.about': 'حول التطبيق',
  'settings.aboutBody':
    '{count} وصفة مدمجة في التطبيق. كل شيء يعمل دون اتصال — بلا حساب، وبلا مفتاح واجهة، وبلا أي اتصال بالشبكة.',
  'settings.carbLimit': '{count} غ',

  'diet.dairyFree': 'خالٍ من الألبان',
  'diet.nutFree': 'خالٍ من المكسرات',
  'diet.eggFree': 'خالٍ من البيض',
  'diet.porkFree': 'بلا لحم خنزير',
  'diet.seafoodFree': 'بلا مأكولات بحرية',
  'diet.vegetarian': 'نباتي',

  'alert.notificationsOffTitle': 'الإشعارات معطّلة',
  'alert.notificationsOffBody':
    'فعّل الإشعارات لتطبيق KetoWeek من إعدادات النظام لتصلك التذكيرات الأسبوعية.',
  'alert.restartTitle': 'أعد فتح التطبيق',
  'alert.restartBody':
    'العربية تُقرأ من اليمين إلى اليسار. أغلق KetoWeek تمامًا ثم افتحه من جديد ليتغيّر اتجاه الواجهة.',

  'recipe.perServing': 'لكل حصة',
  'recipe.serves': 'يكفي {count}',
  'recipe.totalMinutes': '{count} دقيقة إجمالًا',
  'recipe.cookingMinutes': '{count} دقيقة طهي',
  'recipe.ingredients': 'المكونات',
  'recipe.method': 'طريقة التحضير',
  'recipe.macroFootnote':
    '{netCarbs} غ كربوهيدرات صافية · {fiber} غ ألياف · القيم تقديرية لحصة واحدة من {servings}.',
  'recipe.notFoundTitle': 'الوصفة غير موجودة',
  'recipe.notFoundBody': 'لم تعد هذه الوصفة ضمن المكتبة. عد إلى خطة الأسبوع لاختيار غيرها.',
};
