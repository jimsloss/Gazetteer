
## Copy created from ITCareerSwitch/Gazetteer ##

## Creates unique repo which enables user to clone this project if required, without having to clone the full ITCareerSwitch repo ##



Project1: Gazetteer

This was a single page project using leaflet (https://leafletjs.com/) to create an interactive map to cover the page. The users location is used to display their country as the main page.

The View

On the the top right the view can be changed to satellite and other created views. APIs where used extensively in this project, and in this case for creating other views. When the cities view is selected all major cities for the displayed country are shown on the map. There was also a view created for airports but the api provider now charge a subscription for this so it no longer works.

The dropdown bar

At the top there is a dropdown selector, and when a new country is selected the map is updated to reflect this, including the countries borders.

Plus/Mins icons

Top right, as you might expect these simply change the magnification level.

Icons

There are 6 icons, created using fontawesome which, when clicked on, open bootstrap modal to display information related to the country currently selected/displayed. This information is obtained by using jquery and php to make calls to various APIs to obtain the information needed. HTML, CSS, Bootstrap and Javascript are used to display and style the modal and its content.

i : General information related to the country.

Sun icon : Current weather conditions in the country selected.

Euro icon : Currency for the country, with a currency conversion calculator.

News icon : News pertaining to the selected country.

Picture icon : Pictures relating to the selected country.

Wiki icon : Wikidata for the selected country.


My reflection

This of course could be extended in many ways using other APIs, but there was a lot of time and effort went in to this working with a lot of concepts I was just beginning to learn, such as bootstraps modals, leaflet, jquery and php. But it was a great project to work on as it involved bringing together, html, css, bootstrap, javascript, jquery and php.