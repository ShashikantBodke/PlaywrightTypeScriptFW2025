import {test,expect} from '../fixtures/baseFixtures';
//import { LoginPage } from '../pages/LoginPage';
//import { HomePage } from '../pages/HomePage';
import { ResultsPage } from '../pages/ResultsPage';


const searchData =[
        {searchkey:'macbook',resultcount:3},
        {searchkey:'samsung',resultcount:2},
        {searchkey:'imac',resultcount:1},
        {searchkey:'canon',resultcount:1},
       {searchkey:'NokiaDummy',resultcount:0},
];

for(const product of searchData){
test(`Verify product search ${product.searchkey}`,async({homePage})=>{
    // let loginpage =new LoginPage(page);
    // await loginpage.goToLoginPage();
    // let homePage:HomePage=await loginpage.doLogin('auto_cm1lnwi@nal.com','Test@123');
  
    const resultPage:ResultsPage=await homePage.doSearch(product.searchkey);
  //console.log(await resultPage.getSearchReultsCount());
    expect(await resultPage.getSearchReultsCount()).toBe(product.resultcount);
});
}