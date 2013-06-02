(ns yarravis.data
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.algo.generic.math-functions :as math]
            [clojure.tools.reader.edn :as edn]
            [cheshire.core :as json]
            [clj-time.coerce :as time-coerce]
            [clj-time.format :as time-format]))

(def precision 0.0000001)

(defn- csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn- read-csv-data [name]
  (-> (str "data/" name)
      slurp
      csv/read-csv
      csv-to-maps))

(def numeric-field #{:Northing :Easting :Zone})

(def visit-date-kw (keyword "Visit Date"))
(def sub-catchment-kw (keyword "Sub Catchment"))

(def date-field #{visit-date-kw})
(def sub-catchment-field #{sub-catchment-kw})

(defn- simplify-string [value]
  (clojure.string/lower-case (clojure.string/replace value " " "-")))

(defn- parse-ll [s]
  (Double/parseDouble (first (clojure.string/split s #"\s"))))

(defn- convert-date [string]
  (let [fmt (time-format/formatter "dd-MMM-yy")]
     (time-coerce/to-long (time-format/parse fmt string))))

(defn- clean-water [w]
  (into {}
        (for [[k v] w]
          [(keyword k)
           (cond
            (#{:Longitude :Latitude} (keyword k)) (parse-ll v)
            (numeric-field (keyword k)) (Double/parseDouble v)
            (date-field (keyword k)) (convert-date v)
            (sub-catchment-field (keyword k)) (simplify-string v)
            :else v)])))

(defn- water-data []
  (map clean-water (read-csv-data "waterdata.csv")))

(defn- clean-loc [loc]
  {:desc (loc "Location desc from google")
   :desc2 (loc "location desc from data")
   :lat (Double/parseDouble (loc "lat"))
   :long (Double/parseDouble (loc "long"))})

(defn- google-elev [lat long]
  (println "asking google for " lat " / " long)
  (let [results (json/parse-string (slurp (format "http://maps.googleapis.com/maps/api/elevation/json?locations=%f,%f&sensor=false" lat long)) true)]
    (if (= "OK" (:status results))
      (:elevation (first (:results results)))
      (do (println "Bad results for " lat " / " long " : " results)
          nil))))

(def init-elevations (edn/read-string (slurp "data/elevations.clj")))

(def elevations (atom init-elevations))

(defn- gelev [lat long]
  (if (@elevations [lat long])
    (@elevations [lat long])
    (do
      (swap! elevations #(assoc % [lat long] (google-elev lat long)))
      (@elevations [lat long]))))

(defn- water-elev []
  (sort-by :elevation
           (map #(assoc % :elevation (gelev (:Latitude %) (:Longitude %))) (water-data))))

(defn- water-by-locn []
  (group-by #(select-keys % [:Longitude :Latitude :elevation (keyword "Site Name")]) (water-elev)))

(defn- latest-reading [water-readings]
  (first (sort-by #(- (visit-date-kw %)) water-readings)))

(defn- latest-reading-by [water-readings timestamp]
  (->> water-readings
       (filter #(<= (visit-date-kw %) timestamp))
       (sort-by #(- (visit-date-kw %)))
       first))

(defn- water-for-json-grouped []
  (sort-by :elevation
           (for [[k v] (water-by-locn)]
             (assoc k :values v))))

; public
(defn water-readings-by [timestamp]
  (filter visit-date-kw  ; filter out any with no date => not in range
          (sort-by :elevation
                    (for [[k v] (water-by-locn)]
                      (merge k (latest-reading-by v timestamp))))))

; public
(defn date-range []
  (let [by-time (sort-by visit-date-kw (water-elev))
        min (visit-date-kw (first by-time))
        max (visit-date-kw (last by-time))]
    {:body {:min min :max max}}))

; public
(defn sub-catchments []
  {:body (map
           simplify-string
           (set (map
                  sub-catchment-kw
                  (water-data))))})
