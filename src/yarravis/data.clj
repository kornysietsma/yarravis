(ns yarravis.data
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.algo.generic.math-functions :as math]
            [clojure.tools.reader.edn :as edn]
            [cheshire.core :as json]
            [clj-time.coerce :as time-coerce]
            [clj-time.format :as time-format]))

(def precision 0.0000001)

(defn csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn read-csv-data [name]
  (-> (str "data/" name)
      slurp
      csv/read-csv
      csv-to-maps))

(def numeric-field #{:Northing :Easting :Zone})

(def date-field #{(keyword "Visit Date")})

(defn parse-ll [s]
  (Double/parseDouble (first (clojure.string/split s #"\s"))))

(defn convert-date [string]
  (let [fmt (time-format/formatter "dd-MMM-yy")]
     (time-coerce/to-long (time-format/parse fmt string))))

(defn clean-water [w]
  (into {}
        (for [[k v] w]
          [(keyword k)
           (cond
            (#{:Longitude :Latitude} (keyword k)) (parse-ll v)
            (numeric-field (keyword k)) (Double/parseDouble v)
            (date-field (keyword k)) (convert-date v)
            :else v)])))

(defn water-data []
  (map clean-water (read-csv-data "waterdata.csv")))

(defn clean-loc [loc]
  {:desc (loc "Location desc from google")
   :desc2 (loc "location desc from data")
   :lat (Double/parseDouble (loc "lat"))
   :long (Double/parseDouble (loc "long"))})

(defn google-elev [lat long]
  (println "asking google for " lat " / " long)
  (let [results (json/parse-string (slurp (format "http://maps.googleapis.com/maps/api/elevation/json?locations=%f,%f&sensor=false" lat long)) true)]
    (if (= "OK" (:status results))
      (:elevation (first (:results results)))
      (do (println "Bad results for " lat " / " long " : " results)
          nil))))

(def init-elevations (edn/read-string (slurp "data/elevations.clj")))

(def elevations (atom init-elevations))

(defn gelev [lat long]
  (if (@elevations [lat long])
    (@elevations [lat long])
    (do
      (swap! elevations #(assoc % [lat long] (google-elev lat long)))
      (@elevations [lat long]))))

(defn water-elev []
  (sort-by :elevation
           (map #(assoc % :elevation (gelev (:Latitude %) (:Longitude %))) (water-data))))

(defn water-by-locn []
  (group-by #(select-keys % [:Longitude :Latitude :elevation (keyword "Site Name")]) (water-elev)))

(defn latest-reading [water-readings]
  (first (sort-by #(- ((keyword "Visit Date") %)) water-readings)))

(defn water-for-json-grouped []
  (sort-by :elevation
           (for [[k v] (water-by-locn)]
             (assoc k :values v))))

(defn water-for-json []
  (sort-by :elevation
           (for [[k v] (water-by-locn)]
             (merge k (latest-reading v)))))

