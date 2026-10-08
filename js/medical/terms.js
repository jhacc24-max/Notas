// Paquete base de terminología médica en español. Es DATOS, no lógica: ampliable editando este archivo
// o (sin tocar código) desde Ajustes → Diccionario médico. Formato: categoría -> términos.
// Nota: los términos se usan (1) como contexto/“prompt” para el motor de transcripción y
// (2) como apoyo de corrección posterior, en ese orden de importancia.
export const BASE_TERMS = {
  medicamentos: `levodopa carbidopa benserazida pramipexol ropinirol rotigotina rasagilina selegilina safinamida entacapona opicapona amantadina trihexifenidilo biperideno
metformina insulina glargina lispro aspart glibenclamida glimepirida sitagliptina linagliptina empagliflozina dapagliflozina liraglutida semaglutida
enalapril lisinopril captopril ramipril losartán valsartán candesartán irbesartán telmisartán amlodipino nifedipino diltiazem verapamilo atenolol bisoprolol metoprolol carvedilol propranolol nebivolol
hidroclorotiazida clortalidona furosemida torasemida espironolactona eplerenona indapamida sacubitrilo ivabradina digoxina amiodarona flecainida
atorvastatina simvastatina rosuvastatina pravastatina ezetimiba fenofibrato gemfibrozilo
ácido acetilsalicílico aspirina clopidogrel ticagrelor prasugrel warfarina acenocumarol rivaroxabán apixabán dabigatrán edoxabán heparina enoxaparina
paracetamol ibuprofeno naproxeno diclofenaco ketorolaco metamizol celecoxib etoricoxib tramadol codeína morfina fentanilo oxicodona tapentadol buprenorfina
amoxicilina clavulánico ampicilina penicilina cefalexina cefuroxima ceftriaxona cefixima azitromicina claritromicina eritromicina ciprofloxacino levofloxacino moxifloxacino doxiciclina clindamicina metronidazol trimetoprima sulfametoxazol nitrofurantoína vancomicina meropenem fluconazol aciclovir oseltamivir
omeprazol esomeprazol pantoprazol lansoprazol ranitidina famotidina domperidona metoclopramida ondansetrón loperamida lactulosa bisacodilo
salbutamol budesonida formoterol salmeterol fluticasona tiotropio ipratropio montelukast prednisona prednisolona metilprednisolona dexametasona hidrocortisona
levotiroxina metimazol propiltiouracilo alendronato denosumab calcitriol colecalciferol
sertralina fluoxetina escitalopram citalopram paroxetina venlafaxina duloxetina mirtazapina amitriptilina bupropión trazodona litio quetiapina olanzapina risperidona aripiprazol clozapina haloperidol
diazepam lorazepam alprazolam clonazepam zolpidem melatonina gabapentina pregabalina carbamazepina oxcarbazepina valproato lamotrigina levetiracetam topiramato fenitoína fenobarbital
donepezilo rivastigmina galantamina memantina
alopurinol colchicina febuxostat metotrexato hidroxicloroquina azatioprina micofenolato tacrolimus ciclosporina adalimumab etanercept infliximab rituximab
tamoxifeno anastrozol letrozol bicalutamida cisplatino carboplatino paclitaxel docetaxel
loratadina cetirizina desloratadina difenhidramina hidroxizina clorfenamina
sildenafilo tadalafilo tamsulosina finasterida dutasterida oxibutinina solifenacina
sulfato ferroso ácido fólico cianocobalamina vitamina potasio magnesio`,
  enfermedades: `hipertensión arterial diabetes mellitus hipercolesterolemia dislipidemia obesidad síndrome metabólico
enfermedad de Parkinson parkinsonismo temblor esencial distonía corea Huntington esclerosis múltiple esclerosis lateral amiotrófica miastenia gravis epilepsia migraña cefalea neuralgia
enfermedad de Alzheimer demencia deterioro cognitivo accidente cerebrovascular ictus ataque isquémico transitorio hemorragia subaracnoidea hidrocefalia meningitis encefalitis neuropatía polineuropatía
infarto agudo de miocardio angina de pecho cardiopatía isquémica insuficiencia cardíaca fibrilación auricular arritmia taquicardia bradicardia estenosis aórtica miocardiopatía endocarditis pericarditis trombosis venosa profunda tromboembolismo pulmonar aneurisma
asma EPOC enfisema bronquitis neumonía tuberculosis fibrosis pulmonar apnea del sueño bronquiectasias derrame pleural neumotórax
gastritis úlcera péptica reflujo gastroesofágico enfermedad de Crohn colitis ulcerosa síndrome de intestino irritable celiaquía diverticulitis apendicitis pancreatitis colelitiasis colecistitis cirrosis hepatitis esteatosis hepática hemorroides estreñimiento
insuficiencia renal crónica nefropatía diabética litiasis renal pielonefritis cistitis infección urinaria hiperplasia prostática cáncer de próstata incontinencia urinaria
hipotiroidismo hipertiroidismo tiroiditis de Hashimoto enfermedad de Graves osteoporosis artrosis artritis reumatoide lupus eritematoso gota fibromialgia espondilitis lumbalgia hernia discal escoliosis
anemia ferropénica leucemia linfoma mieloma trombocitopenia hemofilia
cáncer de mama cáncer de pulmón cáncer colorrectal melanoma carcinoma metástasis neoplasia tumor benigno
depresión ansiedad trastorno bipolar esquizofrenia trastorno obsesivo compulsivo insomnio trastorno de estrés postraumático
psoriasis dermatitis atópica urticaria eccema acné rosácea herpes zóster
conjuntivitis glaucoma cataratas retinopatía diabética degeneración macular otitis sinusitis rinitis vértigo hipoacusia tinnitus
COVID-19 gripe influenza sepsis VIH`,
  sintomas: `disnea tos expectoración hemoptisis sibilancias dolor torácico palpitaciones síncope mareo vértigo cefalea fiebre escalofríos astenia fatiga anorexia pérdida de peso
náuseas vómitos diarrea estreñimiento disfagia pirosis dolor abdominal distensión melena hematoquecia ictericia prurito edema
poliuria polidipsia polifagia disuria hematuria nicturia temblor rigidez bradicinesia inestabilidad postural festinación hipomimia micrografía hiposmia
parestesias hormigueo debilidad convulsiones afasia disartria diplopía visión borrosa fotofobia acúfenos
somnolencia insomnio ansiedad irritabilidad apatía alucinaciones desorientación pérdida de memoria`,
  anatomia: `cabeza cuello tórax abdomen pelvis columna cervical dorsal lumbar sacro cráneo cerebro cerebelo tronco encefálico médula espinal
corazón aorta arteria vena carótida coronaria pulmón bronquio tráquea laringe faringe esófago estómago duodeno yeyuno íleon colon recto hígado vesícula biliar páncreas bazo
riñón uréter vejiga uretra próstata útero ovario mama tiroides paratiroides hipófisis suprarrenal
hombro codo muñeca mano dedos cadera rodilla tobillo pie tendón ligamento menisco fémur tibia peroné húmero radio cúbito clavícula escápula costilla vértebra
ojo retina córnea cristalino oído tímpano nariz senos paranasales piel`,
  procedimientos: `electrocardiograma ecocardiograma ecografía radiografía tomografía computarizada resonancia magnética gammagrafía PET angiografía coronariografía cateterismo
endoscopia gastroscopia colonoscopia broncoscopia biopsia punción lumbar electroencefalograma electromiograma polisomnografía espirometría holter monitorización ambulatoria de presión arterial
hemograma bioquímica hemoglobina glucosa glucemia hemoglobina glicosilada creatinina urea filtrado glomerular colesterol LDL HDL triglicéridos transaminasas bilirrubina TSH T4 libre PSA ferritina vitamina B12 vitamina D INR dímero D troponina proteína C reactiva
cirugía laparoscopia apendicectomía colecistectomía prótesis marcapasos desfibrilador estimulación cerebral profunda bypass angioplastia stent trasplante diálisis hemodiálisis quimioterapia radioterapia inmunoterapia
fisioterapia rehabilitación logopedia terapia ocupacional vacunación`,
  especialidades: `cardiología neurología neumología gastroenterología nefrología urología endocrinología reumatología hematología oncología dermatología oftalmología otorrinolaringología traumatología ortopedia
psiquiatría psicología geriatría pediatría ginecología obstetricia medicina interna medicina familiar anestesiología radiología cirugía general neurocirugía cirugía vascular infectología alergología rehabilitación urgencias paliativos nutrición`,
  signos: `presión arterial tensión arterial frecuencia cardíaca frecuencia respiratoria saturación de oxígeno temperatura índice de masa corporal peso talla perímetro abdominal glucemia capilar hipotensión ortostática pulso`,
  unidades: `miligramos microgramos gramos mililitros unidades internacionales miligramos por decilitro milimoles por litro milímetros de mercurio latidos por minuto cada ocho horas cada doce horas cada veinticuatro horas en ayunas con las comidas antes de dormir`,
};

/** Alias de errores frecuentes de los reconocedores -> forma correcta. Opcional, ampliable. */
export const BASE_ALIASES = {
  'levo dopa': 'levodopa', 'leva dopa': 'levodopa', 'levo copa': 'levodopa',
  'carbi dopa': 'carbidopa', 'parkinson': 'Parkinson', 'alzheimer': 'Alzheimer',
  'metfornina': 'metformina', 'omeprasol': 'omeprazol', 'ibuprofeno': 'ibuprofeno',
  'pramipexole': 'pramipexol', 'ropinirole': 'ropinirol', 'atorvastatina': 'atorvastatina',
  'acetil salicílico': 'acetilsalicílico', 'hemoglobina glicosilada': 'hemoglobina glicosilada',
  'ecocardiograma': 'ecocardiograma', 'electro cardiograma': 'electrocardiograma',
  'tensión arterial': 'tensión arterial', 'covid 19': 'COVID-19', 'covid': 'COVID-19',
  'e c g': 'ECG', 'e p o c': 'EPOC', 'h b a 1 c': 'HbA1c',
};
