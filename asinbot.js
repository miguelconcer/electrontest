//asinbot.js -> developed with <3 by migueras@


function downloadASINInformation(){

//Retrieve the Country code.
//https://keepa.com/#!imageapi

//database of URLs
    this.START_URL = {
        BUYING_PORTAL: 'https://buyingportal-es.amazon.com/gp/ors/asinstat/asinstat.html?asin=',
        ALASKA : 'https://alaska-eu.amazon.com/index.html?AvailData=Get+Availability+Data&fnsku_simple=',
        IMAGE: 'http://ecx.images-amazon.com/images/I/',
        SELECTION_JSON: 'https://selection.amazon.com/publishDataJson',
        KEEPA_IMG_API: 'https://dyn.keepa.com/pricehistory.png?asin=',
        SELECTION_IMAGES: 'https://selection.amazon.com/productImages?merchantName=amazon_es&asins=',
        SOS_TOOL: 'https://ipc-eu.amazon.com/planning/SOSAsinDetails?scopeId=AMAZON_ES&asin=',
        PRICING_RULES: 'https://pricingrules-eu.amazon.com/item.html?legalEntityId=130&asin=',
        COSTS: 'https://cost.amazon.com/costManagement/costLookup/asin/',
        ASIN_PLAN: 'https://ipc-eu.amazon.com/planning/AsinPlanReview?scopeId=AMAZON_ES&asins=',
        TICKETS: 'https://tt.amazon.com/search?phrase_search_text=',
        BIW: 'https://biw-eu.amazon.com/asinDetailPage.html?asin=',
        FORECASTING: 'https://forecasting-eu.amazon.com/asin/'
    };
    this.END_URL = {
        BUYING_PORTAL: '&vendorCountry=130&iogFilter=85&marketplaceId=A1RKKUPIHCS9HS&distributorFlag=on&unreceivedFlag=on&orderedFrom=10%2F21%2F2017&orderedTo=01%2F19%2F2018&fc=BCN1&vendor=&notVendor=',
        ALASKA : '&marketplaceid=44551&merchantid=695831032&use_scrollbars=&viewtype=summaryview',
        IMAGE: 'http://ecx.images-amazon.com/images/I/',
        KEEPA_IMG_API: '&range=365&domain=es',
        SELECTION_IMAGES: '&styleCode=_SL200_',
        SOS_TOOL: '&includeBuyerPreferredFlagDirective=LOCAL&includeAdvantageMembershipFlagDirective=ALL&includeLandedUnitCostDirective=ALL&overrideVendorSourceSystem=VAR',
        PRICING_RULES: '&go=Go#fullyLoadedCost',
        COSTS:'/showTerminated/false',
        ASIN_PLAN:'&submit=Preview Plans',
        TICKETS:'&search=Search!',
        BIW: '&org=ES',
        FORECASTING: '?group=44551'
    };

//FINAL URLs creator.

   console.log("Retrieving ASIN information...");
   var asin = $('#search').val();

   //get rid of spaces.
   asin = asin.replace(/\s/g, '');

   //here we are going to place the URLs to zero. This will avoid old data showing.

   //Set everything to zero.
   $("#asin_title").html(" ");
   $("#asin_lifecycle").html(" ");
   $("#asin_IPQ").html(" ");
   $("#asin_IBQ").html(" ");
   $("#asin_EAN").html(" ");
   $("#asin_repCat").html(" ");

   $("#asin_vendor_name_sourcing").html(" ");
   $("#asin_vendor_code_sourcing").html(" ");
   $("#asin_cp").html(" ");
   $("#asin_FLcost").html(" ");
   $("#asin_publishedPrice").html(" ");
   $("#asin_netInventory").html(" ");
   $("#EANs_chips").html(" ");

   $("#asin_EANs").html(" ");

   console.log("Hey, this is the submitted button: ");
   console.log( $('#search').val());

   //alaskaFrame
   var iframeAlaska = $('#alaskaFrame');
   var urlAlaskaFrame = self.START_URL.ALASKA+asin+self.END_URL.ALASKA;
   $(iframeAlaska).attr('src', urlAlaskaFrame);

   //AsinStat iFrame
   var iframeAsinstat = $('#asinstatFrame');
   var urlFrame = self.START_URL.BUYING_PORTAL+asin+self.END_URL.BUYING_PORTAL;
   $(iframeAsinstat).attr('src', urlFrame);

   //Costs iFrame
   var iframeCosts = $('#costFrame');
   var urlFrame = self.START_URL.COSTS+asin+self.END_URL.COSTS;
   $(iframeCosts).attr('src', urlFrame);

   //Plan Preview
   var iframePlan = $('#planFrame');
   var urlFrame = self.START_URL.ASIN_PLAN+asin+self.END_URL.ASIN_PLAN;
   $(iframePlan).attr('src', urlFrame);

   //BIW Preview
   var iframeBIW = $('#BIWFrame');
   var urlFrame = self.START_URL.BIW+asin+self.END_URL.BIW;
   $(iframeBIW).attr('src', urlFrame);

   //Forecast Preview
   var iframeForecast = $('#forecastFrame');
   var urlFrame = self.START_URL.FORECASTING+asin+self.END_URL.FORECASTING;
   $(iframeForecast).attr('src', urlFrame);


   //Tickets Preview
   var iframeTickets = $('#ticketsFrame');
   var urlFrame = self.START_URL.TICKETS+asin+self.END_URL.TICKETS;
   $(iframeTickets).attr('src', urlFrame);

//--------------------------------------------------------------------------




   //Pricing rules
   var pricingRulesButton = $('');

   var urlKeepaImage = self.START_URL.KEEPA_IMG_API+asin+self.END_URL.KEEPA_IMG_API;
    $("#asin_image_keepa").attr("src",urlKeepaImage);


   //Download information from IMAGES
   $.ajax({
     type: "GET",
     url: self.START_URL.SELECTION_IMAGES+asin+END_URL.SELECTION_IMAGES,
     data: {
       merchantName: "amazon_es",
       asins: asin,
       styleCode: "_SL200_"
     },
     success: function(data) {
        // here we gather the image url and we update the source of the image
       //$('#summary').html(data);
       $("#asin_image").attr("src",data[0]);
       //console.log(data[0]);
     }
   });

   //Download the selection central global attributes
   $.ajax({
     type: "GET",
     url: self.START_URL.SELECTION_JSON,
     data: {
       merchantName: "amazon_es",
       asins: asin
     },
     dataType: "json",
     async: true,
     success: function(data) {
       console.log(data);
        //here we first parse the JSON file.
       //console.log(data["0"].publishAttributes.product.item_name["0"].value);

       if (!(data["0"].publishAttributes.product.item_name == undefined)) {
         var title_name_parsed = data["0"].publishAttributes.product.item_name["0"].value;
       }
       if (!(data["0"].publishAttributes.product.availability_lifecycle==undefined)) {
         var lifecycle = data["0"].publishAttributes.product.availability_lifecycle["0"].value;
       }
       if (!(data["0"].publishAttributes.product.ean == undefined)) {
         var EAN_code = data["0"].publishAttributes.product.ean["0"].value;
       }
       if (!(data["0"].publishAttributes.product.item_package_quantity==undefined)) {
         var IPQ_number = data["0"].publishAttributes.product.item_package_quantity["0"].value;
       }
       if (!(data["0"].publishAttributes.product.inventory_bundle_quantity == undefined)) {
         var IBQ_number = data["0"].publishAttributes.product.inventory_bundle_quantity["0"].value;
       }
       if (!(data["0"].publishAttributes.product.replenishment_category==undefined)) {
         var repcat_status_parsed = data["0"].publishAttributes.product.replenishment_category["0"].value;
       }

       //check if it's a pantry asin
       if (!(data["0"].publishAttributes.product.replenishment_category==undefined)) {
         var repcat_status_parsed = data["0"].publishAttributes.product.replenishment_category["0"].value;
       }

       //check if it's a prime now asin
       if (!(data["0"].publishAttributes.product.replenishment_category==undefined)) {
         var repcat_status_parsed = data["0"].publishAttributes.product.replenishment_category["0"].value;
       }


      //["0"].publishAttributes.product.ean
      //["0"].publishAttributes.product.ean["0"].value

       if (!(data["0"].publishAttributes.product.ean==undefined)) {
         var listOfEANs = data["0"].publishAttributes.product.ean;
         var EANs_string = "";
         var EANs_html_chips ="";
         for(var i = 0; i < listOfEANs.length; i++) {
           var EAN_code = listOfEANs[i];
           console.log(EAN_code.value);
           var templateChip ='<div class="chip"><p id="asin_EANs">'+EAN_code.value+'</p></div>';
           EANs_html_chips = EANs_html_chips + templateChip;
           //if (i>0) {EANs_string = EANs_string + ",";}
           //EANs_string = EANs_string + EAN_code.value;
          }
          console.log(EANs_string);
          $("#EANs_chips").html(EANs_html_chips);

       }
       //Eans, potential array
       //var EANs_parsed = ["0"].publishAttributes.product.ean;
       //var IPQ_parsed = data["0"].publishAttributes.product.item_name["0"].value;
       $("#asin_title").html(title_name_parsed);
       $("#asin_lifecycle").html(lifecycle);
       $("#asin_IPQ").html(IPQ_number);
       console.log(IPQ_number);
       $("#asin_IBQ").html(IBQ_number);
       $("#asin_EAN").html(EAN_code);
       $("#asin_repCat").html(repcat_status_parsed);
       $("#asin_detail_page_url").attr("href","https://www.amazon.es/gp/product/"+asin);
     }
   });



   //Pricing rules information scrapped
   $.ajax({
     type: "GET",
     url: self.START_URL.PRICING_RULES+asin+self.END_URL.PRICING_RULES,
     async: true,
     success: function(data) {

       $(data).find("tr").each(
         function(index){

           var vcode = "N/A";
           var vcode_name = "";
           //console.log($(this).text());
           //Get the vendor code
           if ($(this).text().indexOf("Vendor Code:") !== -1) {
             //console.log($(this).text());
             var vcodeArray = $(this).text().split('\n');
             //Here we will iterate until we find a char with len=5.
             var arrayLength = vcodeArray.length;
              for (var i = 0; i < arrayLength; i++) {
                vcodeArray[i] = vcodeArray[i].replace(/\s/g, '');
                if (vcodeArray[i].length==5) {
                  vcode = vcodeArray[i];

                  /*$.ajax({
                    type: "GET",
                    url: "https://vendormaster.amazon.com/vm/jsp/VendorEditForm.jsp?vendorCode="+vcode,
                    async: true,
                    success: function(data) {
                      var vendorNameParsed = $(data).filter("#vendorName").val();
                      console.log(vendorNameParsed);
                      $("#asin_vendor_name_sourcing").html(vendorNameParsed);
                    }
                  });*/

                }
              }
             //console.log(vcode);
             $("#asin_vendor_code_sourcing").html(vcode);

           }

           //Get the asin CP
           if ($(this).text().indexOf("Forward Looking CP:") !== -1) {
             //console.log($(this).text());
             var CPArray = $(this).text().split('\n');
             var cp = CPArray[4];
             //console.log(cp);
             $("#asin_cp").html(cp);
           }

           //Get the asin Current Price
           if ($(this).text().indexOf("Forward Looking Cost") !== -1) {
             //console.log($(this).text());
             var FLcostArray = $(this).text().split('\n');
             var FLcost = FLcostArray[7];
             //console.log(FLcost);
             $("#asin_FLcost").html(FLcost);
           }

           //Get the asin Current Price
           if ($(this).text().indexOf("Published Price") !== -1) {
             //console.log($(this).text());
             var publishedPriceArray = $(this).text().split('\n');
             var publishedPrice = publishedPriceArray[8];
             //console.log(publishedPrice);
             $("#asin_publishedPrice").html(publishedPrice);
           }
         });
       }
   });

   //Alaska information
   $.ajax({
     type: "GET",
     url: "https://alaska-eu.amazon.com/index.html?AvailData=Get+Availability+Data&fnsku_simple="+asin+"&marketplaceid=44551&merchantid=695831032&use_scrollbars=&viewtype=summaryview",
     async: true,
     success: function(data) {

       $(data).find("tr").each(
         function(index){
           if ($(this).text().indexOf("NetInventory") !== -1) {
             //console.log($(this).text());
             var inventoryArray = $(this).text().split('\n');
             var inventory = inventoryArray[2];
             //console.log(inventory);
             $("#asin_netInventory").html(inventory);
           }
         });
     },
     error: function (error) {
       console.log("ERROR leyendo ALASKA");
     }
   });

}
