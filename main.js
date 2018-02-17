const electron = require('electron');
const url = require('url');
const path = require('path');

//const username = require('username');

const {app, BrowserWindow, Menu, ipcMain,dialog,globalShortcut,clipboard,shell} = electron;
const autoUpdater = require("electron-updater");

if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

/*

//http://sable-responders-adhoc-dub.amazon.com/datapath/query/catalog/item/-/44551/B074SRVKNS
//http://sable-responders-adhoc-dub.amazon.com/datapath/query//rankedmedia/rankedImagesV2/-/44551/B074SRVKNS

//SOURCE -> https://src-eu.corp.amazon.com/?fnsku=B01M0B3H16


//PROCURABILITY -> https://src-eu.corp.amazon.com/procurability/?asin=B074SRVKNS&country=ES
-> "Could Amazon make customer promises on an out-of-stock ASIN in a given marketplace
considering only the ability of known vendors to supply the ASIN for the foreseeable future?"

Physical ID -> http://ecx.images-amazon.com/images/I/51LasnAE7eL.jpg

GET offer list:
http://offerservice-dumper-tools.integ.amazon.com:8000/v2/#website=Amazon.es&domain=prod&realm=FRAmazon&mkid=44551&method=getOfferListingsForASIN&asin=B01MQT5HSF&condition=Any&mid=&sku=&fmid=&listingType=purchasable&discriminator=

ZOOM on ASIN details:
http://offerservice-dumper-tools.integ.amazon.com:8000/v2/#website=Amazon.es&domain=prod&realm=FRAmazon&mkid=44551&method=getOfferListingsForASIN&asin=B01CE1NM98&condition=Any&mid=695831032&sku=B01CE1NM98&fmid=832676903&listingType=purchasable&discriminator=

IPC RESPONSIBLE?
https://ipc-rules-eu.amazon.com/troubleshooting/home?scopeId=AMAZON_ES#asin=B01MG05FXZ
- IS RESPONSIBLE?
- ANDON CORD?
- SORTABLE?

ASIN REFRESHER -> https://ipc-rules-eu.amazon.com/asinrefresher/home?scopeId=AMAZON_ES

PRINCING RECOMMENDATIONS -> https://pricingrules-eu.amazon.com/rest/itemDetails/44551/695831032/B01LZEK5C4/pricingRulesRecommendationHistory?lastEvaluatedKey=&maxResults=10

EMPIRE -> https://empire.corp.amazon.com

SOTA, HAS A+ PAGE? -> https://sota-es.amazon.com/aplus/editor/search?searchString=B01E3SNO1G
IDQ:
a) title?



//Sales data of the ASIN:
https://forecasting-eu.amazon.com/asin/data/B06Y2T5TL7?group=44551&_=1515772618470



//ASINs linked to EAN code in DR-SKU
https://dr-sku-api.amazon.com/external_ids/skumaster/MAD4/8410100022307
https://dr-sku-api.amazon.com/external_ids/skumaster/MAD4/8410100022307

*/




//install
//npm run package-win






//set enviroment
//development
process.env.NODE_ENV = 'development';

let mainWindow;
let addWindow;
let currentASINselected;

// Listen for app to be ready
app.on('ready', function(){


  //create new window
  mainWindow = new BrowserWindow({
    width: 1300,
    height:800,
    webPreferences: {webSecurity: false},
    title:'Helios'
  });

  //if (process.env.NODE_ENV === 'development'){

  //}else{
    autoUpdater.checkForUpdates();
  //}

  //get username

/*  username().then(username => {
      console.log(username);
      //=> 'sindresorhus'
  });*/

  //load html to window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindows.html'),
    protocol:'file:',
    slashes: true
  }));
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });
  //Build the menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register('CommandOrControl+Alt+J', function () {
    let url_shortcut;
    url_shortcut = "https://www.amazon.es/gp/product/" + clipboard.readText('selection');
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

  globalShortcut.register('CommandOrControl+Alt+Space', function () {
    mainWindow.webContents.send('mainWindow', clipboard.readText('selection'));
    mainWindow.show();
  })

  globalShortcut.register('CommandOrControl+Alt+K', function () {
    let url_shortcut;
    url_shortcut = "https://buyingportal-es.amazon.com/gp/ors/asinstat/asinstat.html?asin=" + clipboard.readText('selection')+"&vendorCountry=130&vendorCountry=165&vendorCountry=102&vendorCountry=108&vendorCountry=129&vendorCountry=115&vendorCountry=103&vendorCountry=101&vendorCountry=133&iogFilter=85&marketplaceId=A1RKKUPIHCS9HS&distributorFlag=on&pendingFlag=on&zeroQtyConfFlag=on&unreceivedFlag=on&orderedFrom=02%2F16%2F2017&orderedTo=05%2F14%2F2025&fc=BCN2&vendor=&notVendor=";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

  globalShortcut.register('CommandOrControl+Alt+U', function () {
    let url_shortcut;
    url_shortcut = "https://transportation-internal-eu.amazon.com/lookups/CarpStatus/CarpStatus-Result.cgi?start_date=&end_date=&fc_id_list=&tz_list=Europe%2FLondon&isrids_area=&isr_states_area=&isaids_area=&isa_states_area=&scacs_area=&usernames_area=&arn_area=&pro_area=&bol_area=&po_area=" + clipboard.readText('selection')+"&submit=Submit&emailto=";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

//https://alaska-eu.amazon.com/index.html?viewtype=summaryview&use_scrollbars=&fnsku_simple=B01LXUZTMH&marketplaceid=44551&merchantid=695831032&AvailData=Get+Availability+Data

  globalShortcut.register('CommandOrControl+Alt+L', function () {
    let url_shortcut;
    url_shortcut = "https://alaska-eu.amazon.com/index.html?viewtype=summaryview&use_scrollbars=&fnsku_simple=" + clipboard.readText('selection')+"&marketplaceid=44551&merchantid=695831032&AvailData=Get+Availability+Data";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

  //https://ipc-eu.amazon.com/planning/AsinPlanReview?scopeId=AMAZON_ES&asins=B01LTI1US2&submit=Preview Plans

  globalShortcut.register('CommandOrControl+Alt+H', function () {
    let url_shortcut;
    url_shortcut = "https://ipc-eu.amazon.com/planning/AsinPlanReview?scopeId=AMAZON_ES&asins=" + clipboard.readText('selection')+"&submit=Preview Plans";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })


  //https://selection.amazon.com/singleItem?merchantName=amazon_es&asin=B075S7V1HZ&selectedTab=productInformationTab
  globalShortcut.register('CommandOrControl+Alt+S', function () {
    let url_shortcut;
    url_shortcut = "https://selection.amazon.com/singleItem?merchantName=amazon_es&asin=" + clipboard.readText('selection')+"&selectedTab=productInformationTab";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

//https://pricingrules-eu.amazon.com/item.html?legalEntityId=130&asin=B01LTI10YG&go=Go
  globalShortcut.register('CommandOrControl+Alt+P', function () {
    let url_shortcut;
    url_shortcut = "https://pricingrules-eu.amazon.com/item.html?legalEntityId=130&asin=" + clipboard.readText('selection')+"&go=Go";
    console.log(url_shortcut);
    shell.openExternal(url_shortcut);
  })

});



// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})

function createAddWindow(){
  // Listen for app to be ready
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  //load html to window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol:'file:',
    slashes: true
  }));
  //Garbage collection handle
  addWindow.on('close', function(){
    addWindow = null;
  });
}

//Catch the item:add
ipcMain.on('item:add', function(e,item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

//Catch the search:add
ipcMain.on('search:add', function(e,item){
  currentASINselected = item;
});


//create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label: 'Go to detail page',
        click(){
          let url_shortcut;
          url_shortcut = "https://www.amazon.es/gp/product/" + currentASINselected;
          console.log(url_shortcut);
          shell.openExternal(url_shortcut);
        },
        accelerator: 'CommandOrControl+Alt+1'
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' :
        'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];
//if mac, add an empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

//add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'developer tools',
    submenu: [
      {
      label: 'Toggle dev tools',
      accelerator: process.platform == 'darwin' ? 'Command+I' :
      'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};
