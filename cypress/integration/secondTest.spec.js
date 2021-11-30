/// <reference types="cypress" />

describe('Test Log Out', () => {

    beforeEach('Log in to the app', () => {
        cy.loginToApplication()
    })

    it('Verifies user can log out sucessfully', () => {
        cy.contains('Settings').click()
        cy.contains('Or click here to logout').click()
        cy.get('.navbar-nav').should('contain', 'Sign up')
    })
})