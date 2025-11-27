//import{test,expect} from '@playwright/test';
import { stat } from 'fs';
import {test, expect} from '../fixtures/baseFixtures';
import { LoginPage } from '../pages/LoginPage';
//import { HomePage } from '../pages/HomePage';

//npm install --save-dev allure-playwright allure-commandline ---for allure installtion 
//npx allure generate allure-results --clean -o allure-report ---Generate report, clean results folder and copy report in allure-report
//npx allure open allure-report -----to open the allure report
//npm i -D playwright-html-reporter -----to open playwright html report

//AAA pattern
test('Verify Valid Login',async({homePage})=>{
    const status=await homePage.isUserLoggedIn();
    expect(status).toBeTruthy();
    await expect(homePage.page).toHaveTitle('My Account')
});

test.skip('Verify in-valid Login',async({page,baseURL})=>{
    let loginpage =new LoginPage(page);
    await loginpage.goToLoginPage(baseURL);
    await loginpage.doLogin('test@abc','test');
    const errorMsg=await loginpage.getInvalidLoginMessage();
    expect(errorMsg).toContain('Warning: No match for E-Mail Address and/or Password.')
});