// Test E2E della NUOVA FEATURE — "alert sotto soglia".
//
// Questi spec vivono in cypress/e2e-new-feature/ e servono come feedback
// rapido MENTRE si sviluppa la feature: girano a ogni push sul branch
// feat/new-feature (vedi .github/workflows/cypress.yml, job "feature-e2e").
// Al merge su main rientrano nella suite completa (job "full-e2e").

describe('Nuova feature · Alert sotto soglia (tecnico)', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-cy=login-tecnico]').click() // il tecnico vede tutti gli impianti
    cy.get('[data-cy=nav-alerts]').click()
  })

  it('mostra la pagina degli alert', () => {
    cy.get('[data-cy=alerts]').should('be.visible')
  })

  it('un impianto sotto soglia da troppo tempo genera un alert', () => {
    // Magazzino Nord (id 3): 11 kW sui 20 attesi, sotto soglia da 50 min -> alert
    cy.get('[data-cy=alert-row-3]').should('be.visible')
    cy.get('[data-cy=alert-real-3]').should('contain', '11 kW')
    cy.get('[data-cy=alert-duration-3]').should('be.visible')
  })

  it('un impianto sopra soglia NON genera alert', () => {
    // Tetto Capannone A (id 1): 45 kW sui 50 attesi (90%) -> nessun alert
    cy.get('[data-cy=alert-row-1]').should('not.exist')
  })
})

describe('Nuova feature · Visibilita per ruolo', () => {
  it('anche il responsabile assistenza vede gli alert', () => {
    cy.visit('/')
    cy.get('[data-cy=login-assistenza]').click()
    cy.get('[data-cy=nav-alerts]').click()
    cy.get('[data-cy=alerts]').should('be.visible')
    cy.get('[data-cy=alert-row-3]').should('exist')
  })
})
