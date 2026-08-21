import type { UIDictionary } from './en';

/** French. Typed as UIDictionary, so omitting any key is a compile error. */
export const fr: UIDictionary = {
  'tab.thisWeek': 'Cette semaine',
  'tab.shopping': 'Courses',
  'tab.saved': 'Enregistrées',
  'tab.settings': 'Réglages',

  'slot.breakfast': 'Petit-déjeuner',
  'slot.lunch': 'Déjeuner',
  'slot.dinner': 'Dîner',
  'slot.snack': 'En-cas',

  'day.today': 'Aujourd’hui',
  'day.tomorrow': 'Demain',
  'day.yesterday': 'Hier',
  'day.sunday': 'Dimanche',
  'day.monday': 'Lundi',
  'day.tuesday': 'Mardi',
  'day.wednesday': 'Mercredi',
  'day.thursday': 'Jeudi',
  'day.friday': 'Vendredi',
  'day.saturday': 'Samedi',
  'dayShort.sunday': 'Dim',
  'dayShort.monday': 'Lun',
  'dayShort.tuesday': 'Mar',
  'dayShort.wednesday': 'Mer',
  'dayShort.thursday': 'Jeu',
  'dayShort.friday': 'Ven',
  'dayShort.saturday': 'Sam',

  'month.1': 'janv.',
  'month.2': 'févr.',
  'month.3': 'mars',
  'month.4': 'avr.',
  'month.5': 'mai',
  'month.6': 'juin',
  'month.7': 'juil.',
  'month.8': 'août',
  'month.9': 'sept.',
  'month.10': 'oct.',
  'month.11': 'nov.',
  'month.12': 'déc.',

  'week.thisWeek': 'CETTE SEMAINE',
  'week.nextWeek': 'SEMAINE PROCHAINE',
  'week.weekOf': 'SEMAINE DU',
  'week.averagePerDay': 'Moyenne par jour',
  'week.netCarbs': 'Glucides nets',
  'week.kcal': '{count} kcal',
  'week.shuffle': 'Changer cette semaine',
  'week.shuffleAgain': 'Changer encore ({count})',
  'week.previousWeek': 'Semaine précédente',
  'week.nextWeekLabel': 'Semaine suivante',
  'week.snackOfTheWeek': 'EN-CAS DE LA SEMAINE',
  'week.netCarbsChip': '{count} g de glucides nets',
  'week.noticeDietIgnored':
    'Aucune recette de {slots} ne respecte tous vos filtres, donc les {slots} de cette semaine les ignorent. Désactiver un filtre suffit à corriger cela.',
  'week.noticeOverTargetOne':
    '1 jour dépasse votre objectif de {limit} g de glucides nets — trop peu de recettes correspondent à vos filtres pour rester en dessous chaque jour.',
  'week.noticeOverTargetMany':
    '{count} jours dépassent votre objectif de {limit} g de glucides nets — trop peu de recettes correspondent à vos filtres pour rester en dessous chaque jour.',

  'macro.fat': 'Lipides {count} g',
  'macro.protein': 'Protéines {count} g',
  'macro.netCarbs': 'Glucides nets {count} g',

  'card.minutes': '{count} min',
  'card.kcal': '{count} kcal',
  'card.netCarbs': '{count} g nets',
  'card.a11yRecipe': '{title}, {count} grammes de glucides nets',
  'card.save': 'Enregistrer la recette',
  'card.unsave': 'Retirer des enregistrées',
  'card.markCooked': 'Marquer comme cuisinée',
  'card.markNotCooked': 'Ne plus marquer comme cuisinée',

  'shopping.title': 'Liste de courses',
  'shopping.subtitle': '{range} · tout pour {days} jours',
  'shopping.thisWeek': 'Cette semaine',
  'shopping.nextWeek': 'Semaine prochaine',
  'shopping.progress': '{done} sur {total} achetés',
  'shopping.reset': 'Réinitialiser',
  'shopping.resetLabel': 'Effacer toutes les coches',
  'shopping.emptyTitle': 'Rien à acheter',
  'shopping.emptyBody':
    'Réactivez au moins un repas dans les Réglages et la liste se remplira toute seule.',

  'aisle.produce': 'Fruits et légumes',
  'aisle.meatSeafood': 'Viandes et poissons',
  'aisle.dairyEggs': 'Crèmerie et œufs',
  'aisle.pantry': 'Épicerie',
  'aisle.spices': 'Épices',
  'aisle.frozen': 'Surgelés',

  'saved.title': 'Enregistrées',
  'saved.emptyHint': 'Touchez le cœur d’une recette pour la garder ici.',
  'saved.countOne': '1 recette enregistrée',
  'saved.countMany': '{count} recettes enregistrées',
  'saved.emptyTitle': 'Aucune recette enregistrée',
  'saved.emptyBody':
    'Les cœurs que vous touchez dans le plan de la semaine apparaissent ici, groupés par repas, pour garder une favorite à un onglet de distance.',

  'settings.title': 'Réglages',
  'settings.subtitle': 'Toute modification ici régénère la semaine en conséquence.',
  'settings.language': 'LANGUE',
  'settings.languageFooter': 'Les recettes, les ingrédients et les étapes sont traduits aussi.',
  'settings.dietaryFilters': 'FILTRES ALIMENTAIRES',
  'settings.dietaryFiltersFooter':
    'Seules les recettes respectant tous les filtres sont planifiées.',
  'settings.dailyNetCarbs': 'GLUCIDES NETS PAR JOUR',
  'settings.dailyNetCarbsFooter':
    'Les recettes sont choisies pour tenir dans ce budget sur la journée. Si trop peu correspondent, la limite est assouplie pour ce repas et la semaine le signale.',
  'settings.mealsToPlan': 'REPAS À PLANIFIER',
  'settings.addSnack': 'Ajouter un en-cas de la semaine',
  'settings.weekStartsOn': 'LA SEMAINE COMMENCE LE',
  'settings.monday': 'Lundi',
  'settings.sunday': 'Dimanche',
  'settings.weeklyReminder': 'RAPPEL HEBDOMADAIRE',
  'settings.reminderToggle': 'Me prévenir quand la nouvelle semaine arrive',
  'settings.reminderFooter': 'Une notification locale — rien ne quitte l’appareil.',
  'settings.about': 'À PROPOS',
  'settings.aboutBody':
    '{count} recettes fournies avec l’app. Tout fonctionne hors ligne — sans compte, sans clé d’API, sans appel réseau.',
  'settings.carbLimit': '{count} g',

  'diet.dairyFree': 'Sans produits laitiers',
  'diet.nutFree': 'Sans fruits à coque',
  'diet.eggFree': 'Sans œuf',
  'diet.porkFree': 'Sans porc',
  'diet.seafoodFree': 'Sans poisson ni fruits de mer',
  'diet.vegetarian': 'Végétarienne',

  'alert.notificationsOffTitle': 'Les notifications sont désactivées',
  'alert.notificationsOffBody':
    'Activez les notifications de KetoWeek dans l’app Réglages pour recevoir le rappel hebdomadaire.',
  'alert.restartTitle': 'Rouvrez l’app',
  'alert.restartBody':
    'L’arabe se lit de droite à gauche. Fermez complètement KetoWeek puis rouvrez-la pour inverser la mise en page.',

  'recipe.perServing': 'Par portion',
  'recipe.serves': 'Pour {count}',
  'recipe.totalMinutes': '{count} min au total',
  'recipe.cookingMinutes': '{count} min de cuisson',
  'recipe.ingredients': 'INGRÉDIENTS',
  'recipe.method': 'PRÉPARATION',
  'recipe.macroFootnote':
    '{netCarbs} g de glucides nets · {fiber} g de fibres · valeurs estimées pour une portion sur {servings}.',
  'recipe.notFoundTitle': 'Recette introuvable',
  'recipe.notFoundBody':
    'Cette recette ne fait plus partie de la bibliothèque. Retournez au plan de la semaine pour en choisir une autre.',
};
