async function fetchData() {
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function processData(data) {
    return data.features.map(earthquake => ({
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0],
        magnitude: earthquake.properties.mag,
        time: new Date(earthquake.properties.time),
        depth: earthquake.geometry.coordinates[2]
    }));
}

function plotMap(data) {
    const latitudes = data.map(e => e.latitude);
    const longitudes = data.map(e => e.longitude);
    const magnitudes = data.map(e => e.magnitude);

    const trace = {
        type: 'scattergeo',
        mode: 'markers',
        lon: longitudes,
        lat: latitudes,
        marker: {
            size: magnitudes.map(mag => mag * 5),
            color: 'rgb(255, 0, 0)',
            opacity: 0.7,
            line: {
                color: 'rgba(255, 255, 255, 0.5)',
                width: 1
            }
        }
    };
    const layout = {
        title: 'Carte du monde des séismes',
        geo: {
            projection: {
                type: 'natural earth'
            },
            showland: true,
            landcolor: 'rgb(227, 227, 227)',
            countrycolor: 'rgb(255, 255, 255)',
            showcountries: true,
            showocean: true,
            oceancolor: 'rgb(204, 230, 255)'
        },
        width: '100%',
        height: '100%'
    };

    Plotly.newPlot('map', [trace], layout);
}

function plotHistogram(data) {
    const histogramData = [{
        x: data.map(d => d.magnitude),
        type: 'histogram',
        xbins: {
            start: 0,
            end: Math.max(...data.map(d => d.magnitude)) + 1,
            size: 0.1
        }
    }];

    const layout = {
        title: 'Distribution de la magnitude des séismes',
        xaxis: { title: 'Magnitude' },
        yaxis: { title: 'Fréquence' },
        width: '100%',
        height: '100%'
    };

    Plotly.newPlot('histogram', histogramData, layout);
}

function plotTimeSeries(data) {
    const groupedData = data.reduce((acc, curr) => {
        const date = curr.time.toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const dates = Object.keys(groupedData);
    const earthquakeCounts = Object.values(groupedData);

    const timeSeriesData = [{
        x: dates,
        y: earthquakeCounts,
        type: 'scatter'
    }];

    const layout = {
        title: 'Séismes par jour de la semaine passée',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Nombre de séismes' },
        width: '100%',
        height: '100%'
    };

    Plotly.newPlot('time-series', timeSeriesData, layout);
}

function plotScatterPlot(data) {
    const scatterData = {
        x: data.map(d => d.magnitude),
        y: data.map(d => d.depth),
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 5,
            color: 'rgba(50, 171, 96, 0.7)',
            line: {
                color: 'rgba(50, 171, 96, 1)',
                width: 1
            }
        }
    };

    const layout = {
        title: 'Magnitude vs profondeur des séismes',
        xaxis: { title: 'Magnitude' },
        yaxis: { title: 'Profondeur (km)' },
        width: '100%',
        height: '100%'
    };

    Plotly.newPlot('scatter-plot', [scatterData], layout);
}

fetchData()
    .then(data => {
        const cleanedData = processData(data);
        plotMap(cleanedData);
        plotHistogram(cleanedData);
        plotTimeSeries(cleanedData);
        plotScatterPlot(cleanedData);
    });
