'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::attraction.attraction', ({ strapi }) => ({
  async search(ctx) {
    const { location, radius, numberOfGuests } = ctx.request.body;

    try {
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyBeSYHJyh5OmxQ_x4O7t_nQjDA7M9h5HmI`
      );


      if (geoResponse.data && geoResponse.data.results.length > 0) {
        const { lat, lng } = geoResponse.data.results[0].geometry.location;
        const radiusInMeters = radius * 1000;

        const knex = strapi.db.connection;

        let query = knex('attractions')
          .select('*')
          .whereRaw(
            `ST_DWithin(
              geography(ST_MakePoint(
                (Real_Address#>>'{coordinates,lng}')::float, 
                (Real_Address#>>'{coordinates,lat}')::float
              )),
              geography(ST_MakePoint(?, ?)),
              ?
            )`,
            [lng, lat, radiusInMeters]
          );
        if (!isNaN(parseInt(numberOfGuests))) {
          query = query.andWhere('Number_of_Guest', parseInt(numberOfGuests));
        }

        const attractions = await query;

        if (attractions.length > 0) {
          ctx.body = attractions;
        } else {
          ctx.body = { message: 'No attractions found within the specified radius' };
        }
      } else {
        console.log('Invalid location:', location);
        ctx.body = { error: 'Invalid location' };
      }
    } catch (error) {
      console.error('Error:', error);
      ctx.body = { error: 'Server error' };
    }
  }
}));
