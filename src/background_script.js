
	( function () {

		chrome.contextMenus.onClicked.addListener( ( info, tab ) => {

			chrome.tabs.executeScript( tab.id, { file: "/content_script.js" });

		});

		chrome.contextMenus.removeAll( () => {

			chrome.contextMenus.create({

				id: "main",
				type: "normal",
				title: "Scrape Chrome Extension APIs",
				contexts: [ "page" ],
				targetUrlPatterns: [ "https://developers.chrome.com/extensions/api_index" ]

			});

		});

	} () );
