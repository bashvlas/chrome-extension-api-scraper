( async function () {

	function download_string ( file_name, str ) {

		var blob = new Blob([ str ]);
		var url = URL.createObjectURL( blob );
		var link = document.createElement( "a" );
		link.download = file_name;
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		delete link;
		URL.revokeObjectURL( url );

	};

	function normalize_links ( element ) {

		var link_arr = element.querySelectorAll( "a" );

		for ( var i = link_arr.length; i--; ) {

			link_arr[ i ].href = link_arr[ i ].href;
			link_arr[ i ].target = "_blank";

		};

	};

	function wait ( time ) {

		return new Promise( function ( resolve ) {

			setTimeout( resolve, time );

		});

	};

	function get_description ( element ) {

		var p_list = element.querySelectorAll( ":scope>p, :scope>code" );

		if ( p_list.length > 0 ) {

			var html = "";

			for ( var i = 0; i < p_list.length; i++ ) {

				html += p_list[ i ].outerHTML;

			};

			return `<div>${ html }</div>`;

		} else {

			return null;

		};

	};

	function table_to_item_data_arr ( table ) {

		var item_data_arr = [];

		for ( var i = 0; i < table.rows.length; i++ ) {

			if ( table.rows[ i ].cells.length > 1 ) {

				var item_data = {};

				item_data.type = table.rows[ i ].cells[ 0 ].innerHTML.trim();
				item_data.name = table.rows[ i ].cells[ 1 ].innerText.trim();
				item_data.description = get_description( table.rows[ i ].cells[ 2 ] );

				if ( item_data.type === "object" || item_data.type === "function" ) {

					var child_table = table.rows[ i ].cells[ 2 ].querySelector( ":scope>table" );

					if ( child_table ) {

						item_data.item_data_arr = table_to_item_data_arr( child_table );

					};

				};

				item_data_arr.push( item_data );

			};

		};

		return item_data_arr;

	};

	function method_header_to_item_data ( header ) {

		var item_data = {};

		item_data.name = header.parentElement.querySelector( "h3" ).innerText.trim();
		item_data.description = get_description( header.parentElement.querySelector( ".description" ) );

		console.log( item_data.name );

		var table = header.parentElement.querySelector( ".description>table" );

		if ( table ) {

			item_data.item_data_arr = table_to_item_data_arr( table );

		};

		return item_data;

	};

	async function url_to_item_data_arr ( url ) {

		var response = await fetch( url );
		var html = await response.text();
		var parser = new DOMParser();
		var doc = parser.parseFromString( html, "text/html" );

		normalize_links( doc );

		var item_data_arr = [];
		var method_header_list = doc.querySelectorAll( "#methods~div>h3[id*=method-]" );

		for ( var i = 0; i < method_header_list.length; i++ ) {

			var item_data = method_header_to_item_data( method_header_list[ i ] );
			item_data_arr.push( item_data );

		};

		return item_data_arr;

	};

	async function get_main_item_data_arr () {

		var rows = document.querySelector( "#stable_apis+p+table" ).rows;    
		var item_data_arr = [];

		normalize_links( document );
		
		for ( var i = 1; i < rows.length; i++ ) {

			if ( i > 1 ) {

				await wait( 5000 );
		
			};

			var item_data = {};
			item_data.name = rows[ i ].cells[ 0 ].innerText.trim();
			item_data.description = rows[ i ].cells[ 1 ].innerHTML;
			item_data.item_data_arr = await url_to_item_data_arr( rows[ i ].cells[ 0 ].querySelector( "a" ).href );

			console.log( item_data.name, item_data );

			item_data_arr.push( item_data );

		};

		return item_data_arr;

	};

	var item_data_arr = await get_main_item_data_arr();
	console.log( item_data_arr );

	download_string( "main_item_arr.json", JSON.stringify( item_data_arr ) );

} () );