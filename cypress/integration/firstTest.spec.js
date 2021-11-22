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
            fixture: 'tags.json'
        })

        cy.loginToApplication()
    })

    it('Verify correct Request and Response', () => {

        cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[placeholder="Article Title"]').type('Automated Article')
        cy.get('[placeholder="What\'s this article about?\"]').type('This article is about automation')
        cy.get('[placeholder="Write your article (in markdown)"]').type('Body of the article')
        cy.contains('Publish Article').click()

        // cy.wait('@postArticles').then(({request, response}) => {
        //     console.log(response)
        //     expect(response.statusCode).to.eq(200)
        //     expect(request.body.article.body).to.eq('Body of the article')
        //     expect(response.body.article.description).to.eq('This article is about automation')
        // })

        cy.wait('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.eq(200)
            expect(xhr.request.body.article.body).to.eq('Body of the article')
            expect(xhr.response.body.article.description).to.eq('This article is about automation')
        })

    })

    it('Mock tags api', () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')

    })

    it('Verify global feed likes count', () => {
        cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.intercept('GET', '**/articles?limit=10&offset=0', {
            fixture: 'articles.json'
        })

        cy.contains('Global Feed').click()
        cy.get('.article-preview button').then(listOfButtons => {
            expect(listOfButtons[0]).to.contain('3')
            expect(listOfButtons[1]).to.contain('2')
            expect(listOfButtons[2]).to.contain('0')
        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[0].slug
            cy.intercept('POST', '**/articles/' + articleLink + '/favorite', file)
        })

        cy.get('.article-preview button')
            .eq(0)
            .click()
            .should('contain', '4')

    })

    it.only('Delete a new article in a global feed', () => {

        let userCredentials = {
            "user": {
                "email": "test@test.com",
                "password": "Testing12345"
            }
        }

        let bodyRequest = {
            "article": {
                "title": "Send API Request from Cypress",
                "description": "TestDescription2",
                "body": "TestBody2",
                "tagList": [
                    "testTag2"
                ]
            }
        }

        cy.request('POST', 'http://localhost:3000/api/users/login', userCredentials)
            .its('body').then(body => {

                let token = body.user.token

                cy.request({
                    url: 'http://localhost:3000/api/articles',
                    headers: { 'Authorization': 'Token ' + token },
                    method: 'POST',
                    body: bodyRequest
                }).then(response => {
                    expect(response.status).to.equal(200)
                })

                cy.contains('Global Feed').click()
                cy.wait(1000)
                cy.get('.article-preview').first().click()
                // cy.get('.container').contains('Delete Article').click()
                cy.get('.container > .article-meta > :nth-child(3) > .btn-outline-danger').contains('Delete Article').click()


                // Verify the article was deleted
                cy.request({
                    url: 'http://localhost:3000/api/articles?limit=10&offset=0',
                    headers: { 'Authorization': 'Token ' + token },
                    method: 'GET',
                }).its('body').then( body => {
                    // console.log(body)
                    expect(body.articles[0].title).not.to.equal('Send API Request from Cypress')
                })

            })
    })

})
