import type { TriggerItem, StrategyItem } from "@/lib/types";

export const TRIGGER_CATALOG: TriggerItem[] = [
  { id: "boredom", name: "Noia", category: "internal", description: "Sensazione di vuoto o mancanza di stimoli." },
  { id: "loneliness", name: "Solitudine", category: "internal", description: "Sensazione di isolamento o mancanza di contatto." },
  { id: "stress", name: "Stress", category: "internal", description: "Tensione o pressione accumulata." },
  { id: "anxiety", name: "Ansia", category: "internal", description: "Irrequietezza o preoccupazione." },
  { id: "sadness", name: "Tristezza", category: "internal", description: "Umore basso o sconforto." },
  { id: "frustration", name: "Frustrazione", category: "internal", description: "Sensazione di blocco o irritazione." },
  { id: "fatigue", name: "Stanchezza", category: "internal", description: "Energia bassa e minore lucidità." },
  { id: "drowsiness", name: "Sonnolenza", category: "internal", description: "Stato di sonno incompleto o sonnolenza." },
  { id: "restlessness", name: "Irrequietezza", category: "internal", description: "Difficoltà a stare fermi senza stimoli." },
  { id: "phone_nearby", name: "Telefono a portata di mano", category: "external", description: "Accesso immediato al dispositivo." },
  { id: "aimless_browsing", name: "Navigazione senza scopo", category: "external", description: "Scorrere contenuti senza un obiettivo chiaro." },
  { id: "provocative_content", name: "Contenuti provocanti", category: "external", description: "Immagini o testi che abbassano la guardia." },
  { id: "bed_with_phone", name: "A letto con il telefono", category: "external", description: "Ambiente e dispositivo associati a vecchie abitudini." },
  { id: "low_lucidity_hours", name: "Orari poco lucidi", category: "external", description: "Momenti della giornata in cui ragionare costa più fatica." },
  { id: "habit_environment", name: "Ambiente associato a vecchie abitudini", category: "external", description: "Luoghi o contesti che attivano sequenze automatiche." },
];

export const STRATEGY_CATALOG: StrategyItem[] = [
  { id: "put_phone_away", name: "Posare il telefono fuori portata", description: "Allontanare fisicamente il dispositivo.", category: "environment" },
  { id: "change_room", name: "Cambiare stanza", description: "Interrompere la sequenza cambiando ambiente.", category: "environment" },
  { id: "drink_water", name: "Bere un bicchiere d'acqua", description: "Azione semplice che crea una pausa.", category: "body" },
  { id: "short_walk", name: "Breve passeggiata", description: "Muovere il corpo per interrompere l'automatismo.", category: "body" },
  { id: "tidy_space", name: "Riordinare un piccolo spazio", description: "Attività pratica breve e concreta.", category: "practical" },
  { id: "read_scripture", name: "Leggere un breve passo biblico", description: "Riorientare la mente su un principio spirituale.", category: "spiritual" },
  { id: "pray", name: "Fare una preghiera", description: "Rivolgermi sinceramente a Geova.", category: "spiritual" },
  { id: "start_task", name: "Iniziare un compito pratico", description: "Dirottare l'attenzione su un'azione utile.", category: "practical" },
  { id: "leave_phone_elsewhere", name: "Lasciare il telefono in un'altra stanza", description: "Ridurre l'accesso immediato.", category: "environment" },
  { id: "if_then", name: "Applicare un piano se-allora", description: "Eseguire una risposta già preparata.", category: "cognitive" },
  { id: "urge_surf", name: "Urge surfing", description: "Osservare l'impulso senza assecondarlo.", category: "cognitive" },
  { id: "look_away", name: "Distogliere lo sguardo", description: "Non soffermarsi volontariamente su contenuti provocanti.", category: "cognitive" },
  { id: "ask_help", name: "Chiedere aiuto", description: "Contattare una persona di fiducia.", category: "relational" },
  { id: "sleep_prep", name: "Preparare l'ambiente prima di dormire", description: "Ridurre i rischi serali in anticipo.", category: "environment" },
];

export const CHAIN_STAGE_LABELS: Record<string, string> = {
  trigger: "Trigger",
  impulse: "Impulso",
  phone: "Telefono",
  search: "Ricerca",
  action: "Azione",
  interrupted_early: "Interrotto all'inizio",
  not_applicable: "Non applicabile",
  prefer_not_to_say: "Preferisco non rispondere",
};

export const GUIDE_PHRASES = {
  impulse: "Un impulso è una sensazione, non un comando.",
  aversion: "Rifiuto ciò che va contro i miei valori, ma non odio me stesso né il mio corpo.",
  intimacy:
    "Una persona che non è mia moglie non mi appartiene. Non ho diritto di appropriarmi mentalmente della sua intimità o del suo corpo alimentando fantasie sessuali su di lei.",
  relapse:
    "Grazie per aver registrato sinceramente quello che è successo. Una ricaduta non cancella i progressi precedenti. Proviamo a capire quale situazione ha abbassato la guardia e quale protezione concreta puoi aggiungere.",
  disclaimer:
    "Questa app è uno strumento personale di supporto spirituale e di consapevolezza. Non sostituisce un medico, uno psicologo, uno psichiatra o un responsabile spirituale.",
};
