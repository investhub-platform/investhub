describe('Auth & Admin Users API Test', () => {

    let accessToken;

    const userId = '6992d0468cc4e5b8d4866f12';

    // 🔐 STEP 1: ADMIN LOGIN
    before(() => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:5000/api/v1/auth/login',
            body: {
                email: 'migaralahiru@gmail.com',
                password: 'migarawijesinghe1234#'
            }
        }).then((response) => {

            // ✔ Validate login
            expect(response.status).to.eq(200);
            expect(response.body.success).to.eq(true);

            // ✔ Extract token
            accessToken = response.body.data.accessToken;

            expect(accessToken).to.be.a('string');

            cy.log('Admin Access Token:', accessToken);
        });
    });

    // 👥 STEP 2: GET ALL USERS
    it('Fetches all users (Admin)', () => {

        cy.request({
            method: 'GET',
            url: 'http://localhost:5000/api/v1/admin/users',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body).to.exist;

            cy.log('All Users:', JSON.stringify(response.body));
        });
    });

    // 👤 STEP 3: GET USER BY ID
    it('Fetches single user by ID (Admin)', () => {

        cy.request({
            method: 'GET',
            url: `http://localhost:5000/api/v1/admin/users/${userId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {

            expect(response.status).to.eq(200);
            expect(response.body).to.exist;

            cy.log('User By ID:', JSON.stringify(response.body));
        });
    });

});