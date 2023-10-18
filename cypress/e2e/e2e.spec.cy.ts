describe('Navigation', () => {
  it('Navigate from Landing page to ARIMA', () => {
    cy.visit('https://automodel.vercel.app')

    cy.get('h1').should('contain', 'AutoModel')

    cy.get('div').contains('Start Modeling').click()

    cy.url().should('include', '/home')

    cy.get('div').contains('ARIMA').click()

    cy.url().should('include', '/arima')
  })
})


describe('Backend Unit Tests', () => {
  it('Button should send input to backend API', () => {
    cy.visit('https://automodel.vercel.app/arima')

    cy.get('h2').should('contain', 'ARIMA')

    cy.get('input').type('AAPL')

    cy.get('button').contains('Model').click()
  })

  it('Data should be displayed after button click', () => {
    cy.visit('https://automodel.vercel.app/arima')

    cy.get('input').type('AAPL')

    cy.get('button').contains('Model').click()

    cy.wait(15000)

    cy.get('div').contains('AAPL')
    cy.get('div').contains('SARIMAX')
    cy.get('div').contains('First Difference')
    cy.get('div').contains('Second Difference')
    cy.get('div').contains('Seasonal Difference')
    cy.get('div').contains('Seasonal First Difference')
  })

  it('API should return a status code 200', () => {
    cy.request('POST', 'https://7pvgmlb63a.execute-api.us-west-1.amazonaws.com/prod/automodel', {"messages": "AAPL"}).then(
      (response) => {
        // Status code 200
        expect(response.status).to.eq(200)
      }
    )
  })
})

describe('Integration Test', () => {
  it('Everything should integrate Perfectly', () => {
    cy.visit('https://automodel.vercel.app')

    cy.get('h1').should('contain', 'AutoModel')

    cy.get('div').contains('Start Modeling').click()

    cy.url().should('include', '/home')

    cy.get('div').contains('ARIMA').click()

    cy.url().should('include', '/arima')

    cy.get('input').type('AAPL')

    cy.get('button').contains('Model').click()

    cy.intercept('POST', 'https://7pvgmlb63a.execute-api.us-west-1.amazonaws.com/prod/automodel', {
      statusCode: 200,
    })
    
    cy.wait(15000)

    cy.get('div').contains('AAPL')
    cy.get('div').contains('SARIMAX')
    cy.get('div').contains('First Difference')
    cy.get('div').contains('Second Difference')
    cy.get('div').contains('Seasonal Difference')
    cy.get('div').contains('Seasonal First Difference')
  })
})