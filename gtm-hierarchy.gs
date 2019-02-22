function getContainers(accounts) {
  var rowsOfData = [];
  accounts.forEach(function(account) {
    // For each account in the list, fetch containers
    var containerList = listContainers(account.accountId) || [];
    
    // For each container, push into rowsOfData[] a new ARRAY (representing a single row) with
    // 1. account.name (from account)
    // 2. container.name
    // 3. container.publicId
    containerList.forEach(function(container) {
      rowsOfData.push([
        account.name,
        container.name,
        container.publicId
      ]);
    });
  });
  return rowsOfData;
}

function getAccounts() {
  // Get the list of accounts the user has access to
  var accountsList = listAccounts();
  
  // Pass the list of accounts to getContainers() and chain the return
  return getContainers(accountsList);
}

function listAccounts() {
  // API call to fetch all GTM accounts belonging to user
  return TagManager.Accounts.list({
    fields: 'account(accountId,name)'
  }).account;
}

function listContainers(accountId) {
  // API call to fetch all containers belonging to a specific GTM account
  return TagManager.Accounts.Containers.list(
    'accounts/' + accountId,
    {fields: 'container(name,publicId)'}
  ).container;
}

function buildRows(sheet, data, numberOfColumns) {
  // Add the data from the hierarchy to the sheet
  var range = sheet.getRange(2, 1, data.length, numberOfColumns);
  range.setValues(data);
}

function buildHeaders(sheet, headers) {
  // Add the headers to the first row of the sheet
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
}

function buildSheet() {
  // Add the headers of the new sheet here in order from left to right
  var headers = ['Account name', 'Container name', 'Container ID'];
  
  // Create a variable for the actual data
  var hierarchy;
  
  // Name of the new sheet
  var sheetName = 'GTM Hierarchy';
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  // If sheet doesn't exist, create it, otherwise clear it
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Add the headers to the first row of the sheet
  buildHeaders(sheet, headers);
  
  // Fetch the full hierarchy and store it in a variable
  hierarchy = getAccounts();
  
  // Populate the sheet with the data
  buildRows(sheet, hierarchy, headers.length);
}

function onOpen() {
  // Create the menu entry for GTM hierarchy
  var menu = SpreadsheetApp.getUi().createAddonMenu();
  menu.addItem('Fetch GTM hierarchy', 'buildSheet');
  menu.addToUi();
}
