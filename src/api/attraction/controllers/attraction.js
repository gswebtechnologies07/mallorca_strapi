'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::attraction.attraction', ({ strapi }) => ({
  async search(ctx) {
    const { location, radius, numberOfGuests } = ctx.request.body;

    try {
      // Get latitude and longitude from the location
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyBeSYHJyh5OmxQ_x4O7t_nQjDA7M9h5HmI`
      );

      if (geoResponse.data && geoResponse.data.results.length > 0) {
        const { lat, lng } = geoResponse.data.results[0].geometry.location;
        const radiusInMeters = radius * 1000;

        const knex = strapi.db.connection;

        // Query to find attractions within the specified radius and number of guests
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

        // Add condition for number of guests
        if (!isNaN(parseInt(numberOfGuests))) {
          query = query.andWhere('Number_of_Guest', '>=', parseInt(numberOfGuests));
        }

        const attractions = await query;

        if (attractions.length > 0) {
          // Populate image URLs
          const populatedAttractions = await Promise.all(attractions.map(async (attraction) => {
            const populatedAttraction = await strapi.entityService.findOne('api::attraction.attraction', attraction.id, {
              populate: ['Featured_Image', 'Gallery']
            });

            return {
              ...attraction,
              Featured_Image: populatedAttraction.Featured_Image ? populatedAttraction.Featured_Image.url : null,
              Gallery: populatedAttraction.Gallery ? populatedAttraction.Gallery.map(image => image.url) : [],
            };
          }));

          ctx.body = populatedAttractions;
        } else {
          ctx.body = { message: 'No attractions found within the specified radius and number of guests' };
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
