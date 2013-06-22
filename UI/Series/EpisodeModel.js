'use strict';
define(['app', 'Series/SeriesModel'], function () {
    NzbDrone.Series.EpisodeModel = Backbone.Model.extend({

        mutators: {
            paddedEpisodeNumber: function () {
                var test = this.get('episodeNumber');
                return this.get('episodeNumber').pad(2);
            },
            day                : function () {
                return Date.create(this.get('airDate')).format('{dd}');
            },
            month              : function () {
                return Date.create(this.get('airDate')).format('{MON}');
            },
            startTime          : function () {
                var start = Date.create(this.get('airDate'));

                if (start.format('{mm}') === '00') {
                    return start.format('{h}{tt}');
                }

                return start.format('{h}.{mm}{tt}');
            },
            end                : function () {

                if (this.has('series')) {
                    var start = Date.create(this.get('airDate'));
                    var runtime = this.get('series').runtime;

                    return start.addMinutes(runtime);
                }
            },
            statusLevel        : function () {
                var episodeFileId = this.get('episodeFileId');
                var currentTime = Date.create();
                var start = Date.create(this.get('airDate'));
                var end = Date.create(this.get('end'));

                if (currentTime.isBetween(start, end)) {
                    return 'warning';
                }

                if (start.isBefore(currentTime) && episodeFileId === 0) {
                    return 'danger';
                }

                if (status === 'Ready') {
                    return 'success';
                }

                return 'primary';
            },
            hasAired           : function () {
                return Date.create(this.get('airDate')).isBefore(Date.create());
            }
        },


        parse: function (model) {
            model.series = new NzbDrone.Series.SeriesModel(model.series);

            return model;
        },

        toJSON: function () {
            var json = _.clone(this.attributes);

            _.each(this.mutators, _.bind(function (mutator, name) {
                // check if we have some getter mutations
                if (_.isObject(this.mutators[name]) === true && _.isFunction(this.mutators[name].get)) {
                    json[name] = _.bind(this.mutators[name].get, this)();
                } else {
                    json[name] = _.bind(this.mutators[name], this)();
                }
            }, this));
           
            if (this.has('series'))
            {
                json.series = this.get('series').toJSON();
            }
            return json;
        },

        defaults: {
            seasonNumber: 0,
            status      : 0
        }
    });

    return NzbDrone.Series.EpisodeModel;
});
