// firstTest.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

/// <reference types="cypress" />

describe('Test with Backend', () => {

    beforeEach('Login to the app', () => {

        cy.intercept('GET', '**/tags', {
            fixture:'tags.json'
        })

        cy.loginToApplication()
    })

    it.skip('Verify correct Request and Response', () =>{

        cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('Automated Article')
        cy.get('[placeholder="What\'s this article about?\"]').type('This article is about automation')
        cy.get('[placeholder="Write your article (in markdown)"]').type('Body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then(({request, response}) => {
            console.log(response)
            expect(response.statusCode).to.eq(200)
            expect(request.body.article.body).to.eq('Body of the article')
            expect(response.body.article.description).to.eq('This article is about automation')
        })

    })

    it.skip('Mock tags api', () => {
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
        
    })

    it('Verify globa feed likes count', () => {
        cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.intercept('GET', '**/articles?limit=10&offset=0', {
            fixture:'articles.json'
        })

        cy.contains('Global Feed').click()
        cy.get('.article-preview button').then( listOfButtons => {
            expect(listOfButtons[0]).to.contain('3')
            expect(listOfButtons[1]).to.contain('2')
            expect(listOfButtons[2]).to.contain('0')
        })

        cy.fixture('articles').then( file => {
            const articleLink = file.articles[0].slug
            cy.intercept('POST', '**/articles/' + articleLink + '/favorite', file)
        })

        cy.get('.article-preview button')
        .eq(0)
        .click()
        .should('contain', '4')




    })

})
