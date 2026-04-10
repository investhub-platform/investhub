// cypress/e2e/simple_test.cy.js

describe('Simple Web Page Test', () => {
    it('Visits Example Page and verifies content', () => {

        cy.visit('http://example.cypress.io');

        // Case-insensitive check (more flexible)
        cy.title().should('match', /cypress/i);

        // Ensure the link exists before clicking
        cy.contains('type').should('be.visible').click();

        // Verify URL change
        cy.url().should('include', '/commands/actions');

        // Type and validate input
        cy.get('.action-email')
            .should('be.visible')
            .type('student@example.com')
            .should('have.value', 'student@example.com');
    });
});