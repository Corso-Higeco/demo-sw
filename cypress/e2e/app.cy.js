describe('SolarWatch - smoke', () => {
  it('apre l\'app e mostra la schermata di login', () => {
    cy.visit('/')
    cy.get('[data-cy=login-card]').should('be.visible')
    cy.contains('SolarWatch').should('be.visible')
  })
})

describe('SolarWatch - navigazione tecnico', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-cy=login-tecnico]').click()
  })

  it('mostra la dashboard con la lista impianti', () => {
    cy.get('[data-cy=dashboard]').should('be.visible')
    cy.get('[data-cy=plant-row-1]').should('be.visible')
    cy.get('[data-cy=plant-power-1]').should('contain', 'kW')
  })

  it('permette di navigare verso gli alert', () => {
    cy.get('[data-cy=nav-alerts]').click()
    cy.get('[data-cy=alerts]').should('be.visible')
  })

  it('apre lo storico e seleziona un impianto', () => {
    cy.get('[data-cy=nav-storico]').click()
    cy.get('[data-cy=storico-plant]').select('Tetto Capannone A')
    cy.get('[data-cy=storico-result]').should('be.visible')
  })

  it('mostra il form per aggiungere un impianto', () => {
    cy.get('[data-cy=nav-addplant]').click()
    cy.get('[data-cy=addplant-name]').should('be.visible')
    cy.get('[data-cy=addplant-submit]').should('be.visible')
  })
})

describe('SolarWatch - accesso cliente', () => {
  it('mostra solo le voci di menu consentite al cliente', () => {
    cy.visit('/')
    cy.get('[data-cy=login-rossi]').click()
    cy.get('[data-cy=current-user]').should('contain', 'cliente')
    cy.get('[data-cy=nav-dashboard]').should('exist')
    cy.get('[data-cy=nav-addplant]').should('not.exist')
    cy.get('[data-cy=nav-report]').should('not.exist')
  })
})

describe('env / secrets', () => {
  it('la chiave API è disponibile ai test', () => {
    const apiKey = Cypress.env('API_KEY')
    expect(apiKey, 'API_KEY deve essere iniettata via CYPRESS_API_KEY')
      .to.be.a('string').and.not.be.empty
  })
})
