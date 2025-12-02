//import{test,expect} from '@playwright/test';
//import { stat } from 'fs';
import {test, expect} from '../fixtures/baseFixtures';
import { LoginPage } from '../pages/LoginPage';
//import { HomePage } from '../pages/HomePage';

//npm install --save-dev allure-playwright allure-commandline ---for allure installtion 
//npx allure generate allure-results --clean -o allure-report ---Generate report, clean results folder and copy report in allure-report
//npx allure open allure-report -----to open the allure report
//npm i -D playwright-html-reporter -----to open playwright html report

//tagging --after v1.32 they added this tagging, npx playwright test --grep '@login'
//tagging - exclude: --grep-invert "@sanity"

//AAA pattern
test('Verify Valid Login @sample  @login @sanity',async({homePage})=>{
    const status=await homePage.isUserLoggedIn();
    expect(status).toBeTruthy();
    await expect(homePage.page).toHaveTitle('My Account');
});

test.skip('Verify in-valid Login',async({page,baseURL})=>{
    const loginpage =new LoginPage(page);
    await loginpage.goToLoginPage(baseURL);
    await loginpage.doLogin('test@abc','test');
    const errorMsg=await loginpage.getInvalidLoginMessage();
    expect(errorMsg).toContain('Warning: No match for E-Mail Address and/or Password.');
});


//Common tags paatern
/**
 * @smoke :Quick sanity test
 * @regression :Full regression suite
 * @critical :Business-critical tests
 * @slow :Long-running tests
 * @flaky :Known unstable tests
 * @api :API tests
 * @ui : UI tests
 * @auth :Authentication tests
 * @p0 , @p1 ://Priority levels 
 * 
 * 
 * Run tests with specific tag : npx playwright test --grep @smoke
 * Run tests with multiple tag (OR): npx playwright test --grep @smoke | @critical
 * Run tests with all tag (AND): npx playwright test --grep "(?=.*@smoke)(?=.*@critical)"
 * Exclude specific tags: npx playwright test --grep-invert @slow
 * Combine include & exclude: npx playwright test --grep @smoke --grep-invert @flaky
 * Advance Filtering, tags smoke or critical: npx playwright test --grep "@smoke|@critical"
 * Test tags with smoke and not a slow: npx playwright test --grep @smoke --grep-invert @slow
 * Test with multiple tags: npx playwright test --grep "(?=.*smoke)(?=.*api)"
 * 
 * package.json
 * json{
 *  "scripts":{
 *      "test:smoke": "playwright test --grep @smoke",
 *      "test:regression": "playwright test --grep @regression",
 *      "test:critical": "playwright test --grep @critical",
 *      "test:no-flaky": "playwright test --grep-invert @flaky",
 * 
 *  }
 * }
 * 
 */

