// Smoke test — SolarWatch.
//
// Pochi controlli veloci sui percorsi critici: verificano che l'app "si accenda"
// e che le funzioni portanti rispondano. Girano a ogni push (feedback rapido),
// prima della suite E2E completa.

describe("SolarWatch · smoke", () => {
  it("l'app si carica e mostra la schermata di login", () => {
    cy.visit("/");
    cy.get("[data-cy=login-card]").should("be.visible");
    cy.contains("SolarWatch").should("be.visible");
  });

  it("il tecnico accede e vede la dashboard con gli impianti", () => {
    cy.visit("/");
    cy.get("[data-cy=login-tecnico]").click();
    cy.get("[data-cy=current-user]").should("contain", "tecnico");
    cy.get("[data-cy=plant-row-1]").should("be.visible");
    cy.get("[data-cy=plant-power-1]").should("contain", "kW");
  });

  it("la navigazione principale risponde", () => {
    cy.visit("/");
    cy.get("[data-cy=login-tecnico]").click();
    cy.get("[data-cy=nav-alerts]").click();
    cy.get("[data-cy=alerts]").should("be.visible");
  });
});
