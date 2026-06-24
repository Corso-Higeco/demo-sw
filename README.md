# SolarWatch

Applicazione web per il **monitoraggio di impianti fotovoltaici**. Un'azienda installa e
gestisce impianti per clienti commerciali: i tecnici controllano la produzione in tempo
reale e intervengono quando un impianto rende meno del previsto.

Progetto realizzato con **Vue 3 (Composition API)** + **Vite**. Dati di esempio in memoria
(nessun database). Test E2E con **Cypress**.

## Requisiti

- Node.js 18+ e npm

## Avvio

```bash
npm install
npm run dev       # server di sviluppo su http://localhost:5173
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
```

## Test E2E (Cypress)

Con l'app in esecuzione (`npm run dev`) in un terminale:

```bash
npm run cy:open   # interfaccia interattiva
npm run test:e2e  # esecuzione headless
```

## Utenti di accesso

La schermata di login permette di scegliere il profilo (nessuna password, è una demo):

| Utente       | Ruolo                    | Visibilità                         |
| ------------ | ------------------------ | ---------------------------------- |
| `tecnico`    | Tecnico di monitoraggio  | Tutti gli impianti                 |
| `assistenza` | Responsabile assistenza  | Tutti gli impianti + report        |
| `rossi`      | Cliente (Supermercati Rossi) | Solo i propri impianti, lettura |
| `verdi`      | Cliente (Logistica Verdi)    | Solo i propri impianti, lettura |

## Funzionalità

- **Dashboard live** — elenco impianti con potenza attuale (kW) e stato OK / Attenzione /
  Allarme / Offline, con aggiornamento periodico.
- **Alert** — impianti che producono sotto soglia oltre la durata consentita, con valore
  atteso, valore reale e durata.
- **Report mensile** — per cliente e mese: energia prodotta, scostamento, eventi di
  allarme; esportazione in CSV e PDF.
- **Storico** — grafico della produzione per impianto e intervallo di date, con download
  dei dati grezzi.
- **Aggiungi impianto** — registrazione di un nuovo impianto associato a un cliente.

## Selettori per i test

Ogni elemento interattivo o rilevante espone un attributo `data-cy` stabile per facilitare
l'automazione dei test (es. `nav-dashboard`, `plant-row-1`, `status-OK`, `report-export-csv`).

## Nota didattica

Questo progetto è pensato come base per un'esercitazione di Quality Assurance.
