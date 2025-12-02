import { Locator, Page } from '@playwright/test';
import { ElementUtil } from '../utils/ElementUtil';
import { ProductInfoPage } from './ProductInfoPage';


export class ResultsPage {

  private readonly page: Page;
  private readonly eleUtil;
  private readonly results: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eleUtil = new ElementUtil(page);
    this.results = page.locator('.product-thumb');
  }

  async getSearchReultsCount(): Promise<number> {
    return this.eleUtil.getNumberOfCounts(this.results);
    // return await this.results.count(); //naveen

  }

  async selectProduct(productName: string): Promise<ProductInfoPage> {
    console.log('==========Product Name=======' + productName);
    await this.eleUtil.click(this.page.getByRole('link', { name: `${productName}` }));
    return new ProductInfoPage(this.page);
  }






}