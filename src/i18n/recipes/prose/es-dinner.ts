import type { RecipeText } from '../types';

export const esDinner: Record<string, RecipeText> = {
  'd-garlic-butter-steak': {
    title: 'Chuletón con mantequilla de ajo y judías verdes',
    blurb: 'Un chuletón muy marcado y regado con mantequilla al tomillo; las judías se terminan en la misma sartén.',
    steps: [
      'Saca los filetes de la nevera 30 minutos antes y sécalos bien. Sálalos con generosidad justo antes de cocinarlos.',
      'Márcalos en una sartén humeante con el aceite, 3 minutos por lado para un punto poco hecho en una pieza de 3 cm.',
      'Baja el fuego, añade la mantequilla, el ajo y el tomillo, y riega la carne con la mantequilla espumosa durante un minuto. Deja reposar sobre una tabla al menos 5 minutos.',
      'Saltea las judías en la mantequilla de ajo de la sartén a fuego fuerte 4 minutos, hasta que se ampollen y queden crujientes.',
      'Corta la carne contra la fibra, riega con los jugos del reposo y termina con limón.',
    ],
  },
  'd-salmon-creamed-spinach': {
    title: 'Salmón al horno con espinacas a la crema y limón',
    blurb: 'Salmón asado justo hasta quedar rosado, sobre un lecho de espinacas cocidas en nata.',
    steps: [
      'Calienta el horno a 200 °C. Salpimenta el salmón y ásalo con la piel hacia abajo 12-14 minutos; debe desmenuzarse pero seguir translúcido en el centro.',
      'Mientras, ablanda el ajo en la mantequilla y poche las espinacas por tandas.',
      'Escurre el agua que suelten las espinacas —si no, la nata no espesará nunca— y añade la nata; cuece 3 minutos.',
      'Incorpora el parmesano, la nuez moscada y un chorro de limón. Sazona y sirve el salmón encima.',
    ],
  },
  'd-chicken-chorizo-olives': {
    title: 'Pollo al horno con chorizo y aceitunas',
    blurb: 'Muslos asados sobre chorizo hasta que la piel cruje y la grasa sale anaranjada.',
    steps: [
      'Calienta el horno a 200 °C.',
      'Mezcla el chorizo, la cebolla, los tomates y las aceitunas con el aceite, el pimentón y el orégano en una bandeja de horno.',
      'Seca la piel del pollo, sálala bien y coloca los muslos encima con la piel hacia arriba. Mantener la piel por encima de la verdura es lo que le permite quedar crujiente.',
      'Asa 35-40 minutos, regando la verdura con la grasa anaranjada una vez a mitad de cocción, hasta que la piel esté bien dorada y los jugos salgan claros.',
    ],
  },
  'd-tuscan-chicken': {
    title: 'Pollo toscano a la crema',
    blurb: 'Pollo marcado en salsa de nata al ajo con tomates secos y espinacas.',
    steps: [
      'Salpimenta el pollo y márcalo en el aceite a fuego medio-alto, 5 minutos por lado, hasta que esté bien dorado. Resérvalo.',
      'Sofríe el ajo y los tomates secos en la misma sartén un minuto, vierte el caldo y raspa todo lo pegado al fondo.',
      'Añade la nata y el orégano y cuece 5 minutos hasta que nape la cuchara.',
      'Devuelve el pollo con sus jugos, incorpora las espinacas hasta que bajen y añade el parmesano. Cuece 5 minutos más y rectifica de sal.',
    ],
  },
  'd-beef-broccoli': {
    title: 'Salteado de ternera y brócoli',
    blurb: 'Rápido, fuerte y brillante: se hace en menos tiempo del que tardas en hervir agua dos veces.',
    steps: [
      'Mezcla la ternera con 1 cda de la soja y déjala reposar mientras preparas el resto. Un salteado no da tiempo a cortar sobre la marcha.',
      'Escalda el brócoli 2 minutos en agua hirviendo y escúrrelo muy bien.',
      'Marca la ternera en un wok muy caliente en dos tandas para que se dore en lugar de guisarse. Retírala.',
      'Saltea el jengibre y el ajo 20 segundos, añade el brócoli y devuelve la carne con el resto de la soja, el vinagre y el aceite de sésamo.',
      'Espolvorea la goma xantana desde cierta altura mientras remueves —si cae toda en un punto se apelmaza— y saltea 30 segundos hasta que la salsa se agarre.',
    ],
  },
  'd-pork-belly-fennel': {
    title: 'Panceta de cerdo asada lenta con ensalada de hinojo',
    blurb: 'Un proyecto de domingo: cuatro horas suaves, veinte minutos fuertes y una corteza que cruje.',
    steps: [
      'Seca la piel por completo y sálala con generosidad. Déjala destapada en la nevera toda la noche si puedes: la piel seca es todo el truco.',
      'Asa a 150 °C durante 4 horas, hasta que una brocheta atraviese la carne sin resistencia.',
      'Sube el horno a 240 °C durante 15-20 minutos, hasta que la piel se ampolle y estalle. Vigílala: pasa de perfecta a quemada muy rápido.',
      'Deja reposar 15 minutos. Mientras, mezcla el hinojo en láminas con la mayonesa, la mostaza, el zumo de limón, el aceite, las semillas de hinojo tostadas y el perejil.',
      'Corta en lonchas gruesas y sirve con la ensalada fría contra la grasa caliente.',
    ],
  },
  'd-cod-herb-butter': {
    title: 'Bacalao al horno con mantequilla de hierbas y espárragos',
    blurb: 'Pescado blanco magro sostenido por una pastilla de mantequilla de perejil y limón que se derrite encima.',
    steps: [
      'Calienta el horno a 200 °C. Mezcla la mantequilla con el perejil picado, el ajo, las alcaparras y la ralladura de limón.',
      'Mezcla los espárragos con el aceite en una bandeja y salpimenta.',
      'Coloca el bacalao sobre los espárragos, sálalo y pon un disco grueso de mantequilla de hierbas sobre cada lomo.',
      'Hornea 12-15 minutos hasta que el pescado se separe en lascas grandes y opacas. Vuelve a regar el pescado con la mantequilla derretida de la bandeja y exprime el limón.',
    ],
  },
  'd-lamb-kofta': {
    title: 'Kofta de cordero con tzatziki',
    blurb: 'Cordero especiado muy hecho a la parrilla, refrescado con yogur de pepino y ajo.',
    steps: [
      'Escurre el pepino rallado apretándolo en un paño y mézclalo con el yogur, un diente de ajo majado y menta picada. Enfría.',
      'Mezcla el cordero con la cebolla rallada, el resto del ajo, las especias, el perejil picado y una buena pizca de sal. Amasa un minuto entero: la mezcla debe volverse ligeramente pegajosa o las koftas se desharán.',
      'Forma 12 cilindros gruesos alrededor de las brochetas y enfría 10 minutos para que se afirmen.',
      'Asa a la parrilla o plancha a fuego fuerte 12-14 minutos, girándolas, hasta que estén tostadas por fuera y justo hechas por dentro.',
      'Sirve con el tzatziki y la cebolla roja en aros.',
    ],
  },
  'd-cauliflower-cheese-bacon': {
    title: 'Coliflor gratinada con queso y bacon',
    blurb: 'La gracia de la salsa sin harina: sabe a más queso, no a menos.',
    steps: [
      'Calienta el horno a 200 °C. Cuece la coliflor solo 5 minutos —termina en el horno— y escúrrela muy bien.',
      'Fríe el bacon hasta que esté crujiente y resérvalo, dejando la grasa en la sartén.',
      'Calienta la nata con el queso crema, la mostaza y la nuez moscada hasta que quede lisa; retira del fuego y funde dentro tres cuartos del cheddar.',
      'Mezcla la coliflor y casi todo el bacon con la salsa, vuelca en una fuente y cubre con el cheddar y el bacon restantes.',
      'Hornea 20-25 minutos hasta que burbujee y la superficie se ampolle.',
    ],
  },
  'd-thai-green-curry': {
    title: 'Curry verde tailandés de pollo',
    blurb: 'Coco, guindilla verde y albahaca, servido sobre arroz de coliflor y no sobre jazmín.',
    steps: [
      'Abre la leche de coco sin agitarla y retira con una cuchara la crema espesa de arriba. Fríe solo esa crema a fuego medio 4-5 minutos hasta que se corte y suelte el aceite.',
      'Sofríe la pasta de curry en ese aceite de coco 2 minutos, hasta que huela como si el bote hubiera duplicado su fuerza.',
      'Añade el pollo y remueve para cubrirlo, vierte el resto de la leche de coco y cuece 12 minutos.',
      'Incorpora las judías y la berenjena y cocina 6 minutos más. Sazona con la salsa de pescado y zumo de lima.',
      'Añade la albahaca fuera del fuego y sirve sobre arroz de coliflor salteado.',
    ],
  },
  'd-meatballs-cream-tomato': {
    title: 'Albóndigas en salsa de tomate y nata',
    blurb: 'Albóndigas de ternera y cerdo guisadas en un tomate a la crema, rico y bajo en carbohidratos.',
    steps: [
      'Mezcla las dos carnes con el huevo, la harina de almendra, la mitad del parmesano, la mitad del ajo, 1 cdta de orégano y bastante sal. Forma 20 bolas con las manos húmedas.',
      'Dóralas en el aceite por tandas —una sartén llena no las dorará— y resérvalas.',
      'Ablanda el resto del ajo en la misma sartén, añade los tomates y el orégano restante y cuece 10 minutos para que se concentre.',
      'Incorpora la nata, devuelve las albóndigas y cuece a fuego suave 15 minutos hasta que estén hechas y la salsa espese.',
      'Termina con el resto del parmesano y albahaca desgarrada.',
    ],
  },
  'd-duck-buttered-cabbage': {
    title: 'Magret de pato con col a la mantequilla',
    blurb: 'Funde la grasa despacio partiendo de una sartén fría y cocina la col dentro.',
    steps: [
      'Sala la piel del pato y coloca los magrets con la piel hacia abajo en una sartén fría y seca. Enciende a fuego medio-bajo. Empezar en frío es lo que funde la grasa en vez de quemarla.',
      'Cocina 12-15 minutos, retirando la grasa según se acumule, hasta que la piel quede fina, dorada y crujiente. Dale la vuelta 3 minutos y deja reposar 8.',
      'Vierte un par de cucharadas de la grasa de pato en una sartén ancha con la mantequilla y sofríe el ajo y la alcaravea 30 segundos.',
      'Añade la col y el tomillo con un chorrito de agua, tapa y cuece al vapor 5 minutos. Destapa y evapora la humedad hasta que los bordes se agarren.',
      'Realza la col con el vinagre y sirve el pato en lonchas por encima.',
    ],
  },
  'd-prawn-scampi': {
    title: 'Langostinos al ajillo con espaguetis de calabacín',
    blurb: 'Langostinos, mantequilla, ajo, vino blanco y limón. Quince minutos, una sartén.',
    steps: [
      'Sala los espaguetis de calabacín en un colador 10 minutos y escúrrelos apretando.',
      'Derrite la mitad de la mantequilla y cocina el ajo y la guindilla suavemente un minuto: dorado pálido, nunca tostado.',
      'Añade los langostinos y cocínalos 90 segundos por lado, hasta que se vuelvan opacos y se curven en una C abierta. Una O cerrada significa que se han pasado.',
      'Vierte el vino, deja borbotear fuerte un minuto y añade el resto de la mantequilla fuera del fuego, moviendo, para que la salsa quede brillante.',
      'Saltea dentro los espaguetis de calabacín 30 segundos y termina con zumo de limón y perejil.',
    ],
  },
  'd-sausage-cabbage-traybake': {
    title: 'Bandeja al horno de salchichas y col',
    blurb: 'Todo en una bandeja, al horno, cuarenta minutos, sin remover.',
    steps: [
      'Calienta el horno a 200 °C.',
      'Bate el aceite, la mostaza, el vinagre y las semillas de hinojo y mezcla dentro los gajos de col y la cebolla. Extiende en una bandeja grande en una sola capa.',
      'Coloca las salchichas entre la verdura y asa 25 minutos.',
      'Da la vuelta a las salchichas y a los gajos de col y asa otros 15 minutos, hasta que las salchichas estén brillantes y los bordes de la col negros y dulces.',
    ],
  },
  'd-halloumi-aubergine-traybake': {
    title: 'Bandeja al horno de halloumi y berenjena',
    blurb: 'Berenjena asada hasta deshacerse, con halloumi encima dorándose.',
    steps: [
      'Calienta el horno a 210 °C. La berenjena necesita calor de verdad o queda correosa en lugar de cremosa.',
      'Mezcla la berenjena y la cebolla con 4 cdas del aceite, el orégano y la guindilla, y asa 20 minutos.',
      'Añade los tomates, coloca el halloumi por encima y riega con el aceite restante.',
      'Asa otros 12-15 minutos, hasta que el halloumi se ampolle y los tomates revienten.',
      'Termina con zumo de limón y una lluvia generosa de perejil.',
    ],
  },
  'd-mushroom-stroganoff': {
    title: 'Estrogonof de champiñones con puré de coliflor',
    blurb: 'Pimentón, nata agria y una montaña de champiñones sobre puré de coliflor con mantequilla.',
    steps: [
      'Cuece la coliflor al vapor 12 minutos hasta que esté muy blanda y tritúrala con la mitad de la mantequilla y bastante sal. Al vapor en lugar de hervida, el puré no queda aguado.',
      'Saltea los champiñones en el aceite a fuego fuerte en dos tandas hasta que estén muy dorados. Resérvalos.',
      'Pocha la cebolla en la mantequilla restante 8 minutos y añade el ajo y el pimentón un minuto.',
      'Devuelve los champiñones, incorpora la mostaza y retira la sartén del fuego antes de mezclar la nata agria, para que no se corte.',
      'Sirve sobre el puré con perejil y más pimienta negra de la que parecería razonable.',
    ],
  },
  'd-thai-green-tofu': {
    title: 'Curry verde tailandés de tofu y judías verdes',
    blurb: 'Tofu crujiente en crema de coco cortada: el curry vegetariano que no queda aguado.',
    steps: [
      'Prensa el tofu entre dos platos con un peso durante 20 minutos y sécalo. El tofu húmedo no se dorará nunca.',
      'Fríe los dados en el aceite a fuego medio-alto, girándolos solo cuando cada cara se despegue sola de la sartén, hasta que estén dorados por todos lados. Resérvalos.',
      'Retira la crema espesa de la superficie de la leche de coco y fríela sola hasta que se corte y se separe el aceite; después cocina en ella la pasta de curry 2 minutos.',
      'Añade el resto de la leche de coco y las judías, cuece 8 minutos y devuelve el tofu con la salsa de soja.',
      'Incorpora las espinacas hasta que bajen, sazona con lima y añade la albahaca fuera del fuego.',
    ],
  },
  'd-cauliflower-steaks-romesco': {
    title: 'Filetes de coliflor con romesco de almendra',
    blurb: 'Lomos gruesos de coliflor bien asados bajo una salsa ahumada de pimiento rojo y almendra.',
    steps: [
      'Calienta el horno a 220 °C. Pinta los filetes de coliflor con 3 cdas del aceite y sazona con fuerza por ambas caras.',
      'Asa 25-30 minutos, dándoles la vuelta una vez, hasta que los bordes estén bien tostados: la coliflor pálida no sabe a nada.',
      'Tritura los pimientos, las almendras, el ajo, el pimentón y el vinagre; después añade el aceite restante en hilo con la máquina en marcha hasta que espese.',
      'Reparte el romesco en los platos, coloca los filetes encima y termina con perejil.',
    ],
  },
  'd-stuffed-portobellos': {
    title: 'Portobellos rellenos de espinacas y ricotta',
    blurb: 'Sombreros grandes de champiñón rellenos de ricotta al limón y gratinados con parmesano.',
    steps: [
      'Calienta el horno a 200 °C. Pinta los champiñones con 2 cdas de aceite, sazona y ásalos con las láminas hacia abajo 8 minutos para que suelten el agua.',
      'Poche las espinacas con el ajo en el aceite restante, escúrrelas apretando y pícalas.',
      'Mezcla las espinacas con la ricotta, la mitad del parmesano, la ralladura de limón y la nuez moscada.',
      'Dale la vuelta a los champiñones, colma con el relleno, cubre con el resto del parmesano y hornea 15 minutos hasta que dore.',
    ],
  },
  'd-courgette-lasagne': {
    title: 'Lasaña de calabacín',
    blurb: 'Calabacín a la plancha en lugar de pasta, en capas con ricotta y una salsa de tomate de cocción larga.',
    steps: [
      'Sala las láminas de calabacín y déjalas 20 minutos; sécalas y márcalas por tandas en la plancha hasta que queden rayadas. Este paso decide si la lasaña se corta o se convierte en sopa.',
      'Cuece los tomates con el ajo, el orégano y 3 cdas de aceite 25 minutos hasta que espesen y queden melosos. Sazona bien.',
      'Calienta el horno a 190 °C. Monta dos veces capas de salsa, calabacín, ricotta y mozzarella, terminando con salsa y todo el parmesano.',
      'Hornea 30-35 minutos hasta que burbujee y se dore; reposa 15 minutos antes de cortar, porque recién salida del horno no se sostiene.',
      'Reparte la albahaca desgarrada al servir.',
    ],
  },
  'd-egg-curry': {
    title: 'Curry de huevo al coco',
    blurb: 'Huevos cocidos guisados en una salsa de coco especiada: cena con la nevera casi vacía.',
    steps: [
      'Cuece los huevos 8 minutos, enfríalos en agua fría y pélalos.',
      'Sofríe la cebolla en el aceite de coco a fuego medio 10 minutos hasta que esté bien blanda y dorada, y añade el jengibre y el ajo un minuto.',
      'Incorpora el curry en polvo y la cúrcuma y cocínalos 60 segundos en el aceite antes de añadir ningún líquido: eso es lo que evita que la salsa sepa a crudo.',
      'Vierte la leche de coco y cuece 10 minutos hasta que espese y oscurezca.',
      'Parte los huevos por la mitad, colócalos con el corte hacia arriba, incorpora las espinacas y termina con cilantro.',
    ],
  },
};
