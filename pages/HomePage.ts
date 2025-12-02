import { Locator, Page } from '@playwright/test';
import { ElementUtil } from '../utils/ElementUtil';
import { LoginPage } from './LoginPage';
import { ResultsPage } from './ResultsPage';


export class HomePage {

    readonly page: Page;
    private readonly eleUtil;
    private readonly loginLink: Locator;
    private readonly logoutLink: Locator;
    private readonly search: Locator;
    private readonly searchicon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.eleUtil = new ElementUtil(page);
        this.logoutLink = page.locator('#column-right').getByRole('link', { name: 'Logout' });
        this.loginLink = page.getByRole('link', { name: 'Login' });
        this.search = page.getByRole('textbox', { name: 'Search' });
        this.searchicon = page.locator('.btn.btn-default.btn-lg');
    }

    async isUserLoggedIn(): Promise<boolean> {
        return await this.eleUtil.isVisible(this.logoutLink);   
    }

    async doLogOut(): Promise<LoginPage> {
        await this.eleUtil.click(this.logoutLink, { timeout: 5000 }, 1);
        await this.eleUtil.click(this.loginLink, { timeout: 5000 }, 1);
        return new LoginPage(this.page);
    }

    async doSearch(searchKey: string): Promise<ResultsPage> {
        console.log(`Search Key : ${searchKey}`);
        await this.eleUtil.fill(this.search, searchKey);
        await this.eleUtil.click(this.searchicon);
        return new ResultsPage(this.page);
    }







}