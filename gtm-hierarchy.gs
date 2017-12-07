function listAccounts() {
  // API call to list all accounts for a Google user
  return TagManager.Accounts.list({
    fields: 'account(accountId,name)'
  }).account;
}

function listContainers(accountId) {
  // API call to list all containers for a give account ID
  return TagManager.Accounts.Containers.list(
    'accounts/' + accountId,
    {fields: 'container(name,publicId)'}
  ).container;
}

function getContainers(accounts) {
  var accountsAndContainers = [];
  accounts.forEach(function(account) {
    // For each account in the list, fetch containers
    var containerList = listContainers(account.accountId);
    
    // For each container, push into accountsAndContainers[] a new array with
    // 1. account.accountName (from account)
    // 2. container.name
    // 3. container.publicId (GTM-XXXXX)
    containerList.forEach(function(container) {
      accountsAndContainers.push([
        account.name,
        container.name,
        container.publicId
      ]);
    });
  });
  
  // Return the hierarchy to getAccounts(), which returns it to buildSheet()
  return accountsAndContainers;
}

function getAccounts() {
  // Get the list of accounts the user has access to
  var accountsList = listAccounts();
  
  // Pass the list of accounts to getContainers()
  return getContainers(accountsList);
}

function buildRows(sheet,hierarchy,numColumns) {
  // Add the data from the hierarchy to the sheet
  var range = sheet.getRange(2,1,hierarchy.length,numColumns);
  range.setValues(hierarchy);
}

function buildHeaders(sheet, headers) {
  // Add the headers to the first row of the sheet
  var range = sheet.getRange(1,1,1,headers.length);
  range.setValues([headers]);
}

function buildSheet() {
  // Add the headers of the new sheet here in order from left to right
  var headers = ['Account name', 'Container name', 'Container ID'];
  
  // Name of the new sheet
  var sheetName = 'GTM Hierarchy';
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var hierarchy;
  
  // If sheet doesn't exist, create it, otherwise empty it
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Add the headers to the first row of the sheet
  buildHeaders(sheet, headers);
  
  // Fetch the full hierarchy and store it in variable
  hierarchy = getAccounts();
  
  // Build the hierarchy in the rows 2-n of the sheet
  buildRows(sheet, hierarchy, headers.length);
}

function onOpen() {
  // Create the menu entry for GTM hierarchy
  var menu = SpreadsheetApp.getUi().createAddonMenu();
  menu.addItem('Fetch GTM hierarchy', 'buildSheet');
  menu.addToUi();
}
