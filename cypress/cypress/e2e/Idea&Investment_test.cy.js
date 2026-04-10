describe('Ideas API Test (Protected)', () => {

    let accessToken;
    const ideaId = '699d48160e55dd6dc6cf5954';

    // LOGIN
    before(() => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:5000/api/v1/auth/login',
            body: {
                email: 'yrukshan345@gmail.com',
                password: 'yrukshan1234#'
            }
        }).then((response) => {

            // Assertions
            expect(response.status).to.eq(200);
            expect(response.body.success).to.eq(true);

            // Extract token
            accessToken = response.body.data.accessToken;

            expect(accessToken).to.be.a('string');

            cy.log('Access Token:', accessToken);
        });
    });

    // GET ALL IDEAS
    it('Fetches all ideas', () => {

        cy.request({
            method: 'GET',
            url: 'http://localhost:5000/api/v1/ideas',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body).to.exist;

            cy.log('All Ideas:', JSON.stringify(response.body));
        });
    });

    // GET IDEA BY ID
    it('Fetches single idea by ID', () => {

        cy.request({
            method: 'GET',
            url: `http://localhost:5000/api/v1/ideas/${ideaId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body).to.exist;

            cy.log('Idea By ID:', JSON.stringify(response.body));

            // Optional strong checks (enable if needed)
            // expect(response.body.data).to.have.property('_id', ideaId);
        });
    });
});