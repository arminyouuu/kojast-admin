const { supabase } = require('../config/database');

class PlaceRepository {
  async findAll(filters = {}) {
    const { categoryId, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('places')
      .select('*, category:categories(id, name), images:place_images(id, image_url, display_order)', { count: 'exact' });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data.map(place => ({
        ...place,
        images: (place.images || []).sort((a, b) => a.display_order - b.display_order)
      })),
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    };
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('places')
      .select('*, category:categories(id, name), images:place_images(id, image_url, display_order)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      data.images = (data.images || []).sort((a, b) => a.display_order - b.display_order);
    }

    return data;
  }

  async create(placeData) {
    const { images, ...placeInfo } = placeData;

    const { data: place, error: placeError } = await supabase
      .from('places')
      .insert(placeInfo)
      .select()
      .single();

    if (placeError) throw placeError;

    if (images && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        place_id: place.id,
        image_url: url,
        display_order: index
      }));

      const { error: imagesError } = await supabase
        .from('place_images')
        .insert(imageRecords);

      if (imagesError) throw imagesError;
    }

    return this.findById(place.id);
  }

  async update(id, placeData) {
    const { images, ...placeInfo } = placeData;

    const { data: place, error: placeError } = await supabase
      .from('places')
      .update(placeInfo)
      .eq('id', id)
      .select()
      .single();

    if (placeError) throw placeError;

    if (images !== undefined) {
      await supabase
        .from('place_images')
        .delete()
        .eq('place_id', id);

      if (images.length > 0) {
        const imageRecords = images.map((url, index) => ({
          place_id: id,
          image_url: url,
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('place_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }
    }

    return this.findById(id);
  }

  async delete(id) {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = new PlaceRepository();
