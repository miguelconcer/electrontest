
function IdqButton() {

    // URLs for API calls usually require permission in manifest. The images base url does not require extra permissions.
    this.URLS = {
        AVS_EU: 'https://avs-eu.aka.amazon.com',
        DATAPATH_EU : 'http://sable-responders-adhoc-dub.amazon.com/',
        IMAGE: 'http://ecx.images-amazon.com/images/I/'

        // If ever extended to NA marketplaces -> uset this Datapath responder for development
        //DATAPATH_NA: "http://sable-responders-adhoc-iad.iad.proxy.amazon.com/"
    };

    this.ERROR = {
        FILLING_TASK: 'Not possible to filled the task. Please contact the system admin.',
        FETCHING_DATA: 'Error while fetching data. Please contact the system admin.',
        QUERYING_TABS: 'Error while processing current tab. Please contact the system admin.'
    };

    this.WARN = {
        MARKETPLACE_NOT_SUPPORTED: ' is not supported by this extension.',
        NO_ASIN: 'Please go to an Amazon product detail page.'
    };

    this.MESSAGE_NO_DESCRIPTION = 'The detail page for ${asin} does not contain a description.';

    // Map to marketplace ID and AVS Task Name, also lists the marketplaces supported by this extension.
    this.MARKETPLACE_MAP = new Map();
    this.MARKETPLACE_MAP.set('www.amazon.co.uk', {id: '3', avsName: 'UK'})
                        .set('www.amazon.de', {id: '4', avsName: 'DE'})
                        .set('www.amazon.fr', {id: '5', avsName: 'FR'})
                        .set('www.amazon.it', {id: '35691', avsName: 'IT'})
                        .set('www.amazon.es', {id: '44551', avsName: 'ES'});

    this.REGEX = {
        URL_ASIN: new RegExp('\/(dp|product)\/([0-9]{9}[0-9X]|[A-Z][A-Z0-9]{9})'),
        SLASH_ASIN: new RegExp('\/([0-9]{9}[0-9X]|[A-Z][A-Z0-9]{9})')
    };

    this.TASK_PREFILL = {
        taskTitle: 'IDQ Task for ASIN ${asin}',
        activityLevel: 'L2',
        focusArea: 'Conversion',
        activity: 'Maintain IDQ',
        taskType: 'IDQ Button Request'
    };

    // Object to store all information about current Detail Page
    this.detailPage = {};

    this.errorMessageIsShown = false;

    this._init();
}

IdqButton.prototype = {

    _init: function () {

        const self = this;

        const createTaskButton = document.querySelector('.create-task');
        createTaskButton.addEventListener('click', self.createTaskAction.bind(self));

        browser.runtime.onMessage.addListener(function(request){
            if(request.type === 'error') {
                self.onError(self.ERROR.FILLING_TASK, request.message);
            }
        });

    },
    /**
     * Query the current tab to parse Marketplace and ASIN from URL.
     */
    getCurrentTab : function () {
        const self = this;

        browser.tabs.query({currentWindow: true, active: true})
            .then(self.getMarketplaceAsinFromTab.bind(self), self.onError.bind(self, self.QUERYING_TABS) );
    },
    /**
     * Called by browser.tabs.query on popup load.
     * @param tabs passed from browser.tabs.query
     */
    getMarketplaceAsinFromTab : function (tabs) {

        const self = this;

        if (tabs[0].url) {

            const url = new window.URL(tabs[0].url);

            if (url.hostname.indexOf('www.amazon.') >= 0) {

                self.detailPage.marketplace = url.hostname;

                if(self.MARKETPLACE_MAP.has(self.detailPage.marketplace )) {

                    $(".marketplace").html( self.detailPage.marketplace );

                    self.detailPage.asin = self.parseAsin(url.pathname);

                    if (self.detailPage.asin) {
                        $(".asin").html( self.detailPage.asin );
                        self.disabledControl(false);
                    } else {
                        self.onWarning(self.WARN.NO_ASIN);
                    }
                } else {
                    self.onWarning(self.detailPage.marketplace  + self.WARN.MARKETPLACE_NOT_SUPPORTED);
                }
            } else {
                self.onWarning(self.WARN.NO_ASIN);
            }
        } else {
            self.onError(self.ERROR.QUERYING_TABS);
            console.log('tab.url not defined, probably missing permissions.');
        }
    },
    /**
     * Identifies ASIN inside URL
     * @param urlPath path from URL
     * @returns String asin
     */
    parseAsin : function (urlPath) {
        const self = this;

        if(self.REGEX.URL_ASIN.test(urlPath)) {
            // If /dp/ASIN/ or /product/ASIN/ is matched in URL path, match in it the ASIN and return.
            return self.REGEX.SLASH_ASIN.exec(self.REGEX.URL_ASIN.exec(urlPath)[0])[0].slice(1);
        } else if(self.REGEX.SLASH_ASIN.test(urlPath)) {
            // When neither /dp/ASIN/ nor /product/ASIN/ are found, try only /ASIN/.
            // This can cause false positive on non-detail page Amazon page but that is preferred over false negative.
            return self.REGEX.SLASH_ASIN.exec(urlPath)[0].slice(1);
        }
        return "";
    },
    /**
     * Action called by button listener.
     */
    createTaskAction : function () {

        const self = this;

        self.hideError();

        const marketplace = self.detailPage.marketplace;

        const marketplaceId = self.MARKETPLACE_MAP.get(marketplace).id;

        const asin = self.detailPage.asin;

        if (asin) {
            self.fetchAreasValues(self.URLS.DATAPATH_EU, marketplaceId, asin);
        } else {
            self.onWarning(self.WARN.NO_ASIN);
        }
    },
    /**
     * Fetches product details and images from Datapath
     * @param responderUrl Datapath Sable Responder URLS
     * @param marketplaceId
     * @param asin
     */
    fetchAreasValues : function (responderUrl, marketplaceId, asin) {

      //http://sable-responders-adhoc-dub.amazon.com/datapath/query/catalog/item/-/44551/B074SRVKNS
      //http://sable-responders-adhoc-dub.amazon.com/datapath/query//rankedmedia/rankedImagesV2/-/44551/B074SRVKNS


        const self = this;

        const promises = [];

        promises.push($.ajax({
            type: 'GET',
            url: responderUrl + 'datapath/query/catalog/item/-/' + marketplaceId + '/' + asin,
            contentType: 'application/json',
            dataType: 'json'
        }));

        promises.push($.ajax({
            type: 'GET',
            url: responderUrl + 'datapath/query/rankedmedia/rankedImagesV2/-/' + marketplaceId + '/' + asin,
            data: {
                maxImages: 0
            },
            contentType: 'application/json',
            dataType: 'json'
        }));

        $.when.apply($, promises).done(function () {
                // store fetched information about product
                self.detailPage.product = promises[0].responseJSON.product;
                self.detailPage.product.images = promises[1].responseJSON.merchantImages;
                self.createNewWinstonTab();
            }
        ).fail(function (xhr, status, errorThrown) {
            console.log('Fetch Data Error: ' + errorThrown);
            console.log('Status: ' + status);
            console.dir(xhr);
            self.onError(self.ERROR.FETCHING_DATA, errorThrown);
        });

    },
    /**
     * Called after all product details and images are successfully fetched,
     * stores information for new Winston Task and creates new browser tab with Winston Task
     */
    createNewWinstonTab : function () {

        const self = this;

        self.storeTaskInfo();
        const creating = browser.tabs.create({
            url: self.URLS.AVS_EU + '/task'
        });
        creating.then(self.onWinstonTabCreated.bind(self), self.onError.bind(self, self.ERROR.FILLING_TASK) );
    },
    /**
     * When created new tab with Winston Task calls script to pre-fill it with saved information
     * @param tab new opened tab
     */
    onWinstonTabCreated : function (tab) {

        const self = this;

        const executing = browser.tabs.executeScript(tab.id, {
            file: '/prefill/prefill-task.js',
            runAt: 'document_start'
        });
        executing.catch(self.onError.bind(self, self.ERROR.FILLING_TASK) );

        // If no error message is shown to user, the popup can be automatically closed.
        if (!self.errorMessageIsShown) {
            window.close();
        }
    },
    /**
     * Fills and stores to browser storage information for new Winston Task
     */
    storeTaskInfo : function () {

        const self = this;

        const jsonObj = encodeURI(JSON.stringify({
            'title': self.TASK_PREFILL.taskTitle.replace('${asin}', self.detailPage.asin),
            'description': self.buildTaskDescription(self.detailPage.product, self.detailPage.asin),
            'marketPlaceList': self.MARKETPLACE_MAP.get(self.detailPage.marketplace).avsName,
            'activityLevel': self.TASK_PREFILL.activityLevel,
            'focusArea': self.TASK_PREFILL.focusArea,
            'activity': self.TASK_PREFILL.activity,
            'taskType': self.TASK_PREFILL.taskType
        }));

        if (browser.storage) {
            const storing = browser.storage.local.set({AVSCloneObject: jsonObj});
            storing.catch(self.onError.bind(self, self.ERROR.FILLING_TASK) );
        } else {
            console.log('browser.storage not defined, probably missing permissions.');
            self.onError(self.ERROR.FILLING_TASK);
        }
    },
    /**
     * Builds description text for new Winston task containing all selected areas
     * @returns String description for task
     */
    buildTaskDescription : function (detailPageData, asin) {

        const self = this;

        const title = detailPageData.item_name[0].value;

        let bullets = '';
        const bulletsList = detailPageData.bullet_point;
        $.each(bulletsList, function (index, bullet) {
            bullets += '* ' + bullet.value + '<br>';
        });

        // Description is often missing on DP
        let description = self.MESSAGE_NO_DESCRIPTION.replace('${asin}', asin);
        if (detailPageData.product_description) {
            description = detailPageData.product_description[0].value;
        }

        let images = '';
        $.each(detailPageData.images, function (index, image) {
            let imagePath = self.URLS.IMAGE + image.large.physicalID + '.' + image.large.extension;
            images += self.buildImageTag(imagePath, image.large.variant);
        });

        let result = '';

        if ($('#title').is(':checked')) {
            result = result + self.buildParagraph('Title', title);
        }
        if ($('#bullets').is(':checked')) {
            result = result + self.buildParagraph('Bullets', bullets);
        }
        if ($('#description').is(':checked')) {
            result = result + self.buildParagraph('Description', description);
        }
        if ($('#images').is(':checked')) {
            result = result + self.buildImagesParagraph(images);
        }

        return result;
    },

    buildParagraph : function (areaTitle, oldValueText) {
        const oldValue = $('<strong>').text(areaTitle + ' - Old value');
        const newValue = $('<strong>').text(areaTitle + ' - New value');
        return $('<p>').html(oldValue)
            .append('<br />')
            .append(oldValueText)
            .append('<br /><br />')
            .append(newValue)
            .append('<br /><br />')
            .prop('outerHTML');
    },

    buildImagesParagraph : function (currentImagesTags) {
        const areaTitle = $('<strong>').text('Current images:');
        const instructions = $('<strong>').text('Delete images that do not need changes. Provide new images which need to be replaced.');
        return $('<p>').html(areaTitle)
            .append(currentImagesTags)
            .append(instructions)
            .prop('outerHTML');
    },

    buildImageTag : function (src, imageVariant) {
        const imageElement = $('<img alt="">').attr('src', src).attr('style', 'height:100px; width:100px');
        return $('<p>').html($('<strong>').text(imageVariant))
            .append('<br />')
            .append(imageElement)
            .prop('outerHTML');
    },

    disabledControl : function (disabled) {
        $(':checkbox').prop('disabled',disabled);
        $(':button').prop('disabled',disabled);
    },

    onError : function (errorMessageToShow, error) {
        if(error) {
            console.log('Error: ' + error.origin + ' - ' + error.name + ' - ' + error.message);
        }
        this.errorMessageIsShown = true;

        // Hide error if there already is some to always show only one to the user.
        this.hideError();
        this.showMessageToUser(errorMessageToShow, 'error');
    },

    onWarning : function (warningMessageToShow) {
        this.showMessageToUser(warningMessageToShow, 'warning');
    },

    showMessageToUser : function (messageToShow, messageClass) {
        const warningP = document.createElement('p');
        warningP.setAttribute('class', messageClass);
        warningP.innerText = messageToShow;

        document.querySelector('#popup-error-msg').appendChild(warningP);
    },

    hideError : function () {
        document.querySelector('#popup-error-msg').innerHTML = '';
    }

};

$(document).ready(function() {

    const idqButton = new IdqButton();

    idqButton.disabledControl(true);

    idqButton.getCurrentTab();

});
