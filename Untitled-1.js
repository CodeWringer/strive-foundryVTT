entities: new Map(),
    ids: new Map(),
    /**
     * The current entity count. 
     * @type {Number}
     */
    entityCount: 0,
    /**
     * Adds the given entity to the entities set. 
     * Returns its id. 
     * @param {Object} entity An entity to add. 
     * @returns {String} The id of the entity. 
     */
    addEntity: function(entity) {
      if (this.entities.has(entity)) {
        return this.entities.get(entity);
      }

      const id = this.createUUID();

      this.ids.set(id, entity);
      this.entities.set(entity, id);

      this.entityCount += 1;
      return id;
    },
    /**
     * Removes the entity with the given id from the entities set. 
     * @param {String} id The id of the entity to remove. 
     */
    removeEntityById: function(id) {
      if (!this.ids.has(id)) return;

      const entity = this.ids.get(id);

      this.ids.delete(id);
      this.entities.delete(entity);

      this.entityCount -= 1;
    },
    /**
     * Tries to remove the given entity from the entities set. 
     * @param {Object} entity An entity to remove from the entities set. 
     */
    removeEntity: function(entity) {
      if (!this.entities.has(entity)) return;
      this.removeEntityById(this.entities.get(entity));
    },
    /**
     * Returns the entity with the given id. 
     * @param {String} id The id of the entity to return. 
     * @returns {Object} An entity. 
     */
    getEntityById: function(id) {
      if (!this.ids.has(id)) return undefined;
      return this.entities.get(id);
    },
    /**
     * Returns the id of the given entity. 
     * @param {Object} entity An entity, whose id is to be returned. 
     * @returns {String} The id of the entity. 
     */
    idOf: function(entity) {
      if (!this.entities.has(entity)) return undefined;
      return this.entities.get(entity);
    }