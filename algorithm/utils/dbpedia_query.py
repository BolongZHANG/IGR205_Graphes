''' 
makes queries through sparql to dbpedia
Return
    types and subjects values associated with given keywords.
'''
import sys
import traceback
import urllib.request
import urllib.parse
import urllib.error
import urllib.request
import urllib.error
import urllib.parse
import json


def query(q, epr, f='application/json'):
    try:
        params = {'query': q}
        params = urllib.parse.urlencode(params)
        opener = urllib.request.build_opener(urllib.request.HTTPHandler)
        request = urllib.request.Request(epr + '?' + params)
        request.add_header('Accept', f)
        request.get_method = lambda: 'GET'
        url = opener.open(request)
        return url.read()
    except:
        e = sys.exc_info()[0]
        traceback.print_exc(file=sys.stdout)
        raise e


def main():
    argc = len(sys.argv)

    if argc == 1:
        print("Error: no keyword given.")
        exit(0)

    bl_types = []
    bl_subjects = []

    for i in range(argc - 1):
        keyword = sys.argv[i + 1]

        blah = print_types(keyword)
        bl_types.append(blah)

        blah = print_subjects(keyword)
        bl_subjects.append(blah)

    exit(0)


def print_types(q):
    myquery = """
        PREFIX w3t: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?y
        WHERE {
         dbr:""" + q + """ w3t:type ?y.
        }
        """

    # extract the type of the keyword from the returned json string
    # http://www.w3.org/1999/02/22-rdf-syntax-ns#type
    json_obj = query(myquery, "http://dbpedia.org/sparql")
    json_data = json.loads(json_obj)
    results = json_data['results']
    results_data = results['bindings']

    if len(results_data) == 0:
        print((q + ' has no type attribute'))
        return []
    else:
        print((q + ' has the following type attributes:'))

    type_list = []
    for i in range(len(results_data)):
        current_index = results_data[i]
        current_obj = current_index['y']
        obj_type = current_obj['value']
        print(('\t' + obj_type))
        type_list.append(obj_type)
    return type_list


def print_subjects(q):
    # get the subject lines that the keyword falls under
    myquery = """
       PREFIX purl: <http://purl.org/dc/terms/>
       SELECT ?y
       WHERE {
        dbr:""" + q + """ purl:subject ?y.
       }
       """

    json_obj = query(myquery, "http://dbpedia.org/sparql")
    json_data = json.loads(json_obj)
    results = json_data['results']
    results_data = results['bindings']

    if len(results_data) == 0:
        print((q + ' has no subject attribute'))
        return []
    else:
        print((q + ' has the following subject attributes:'))
    type_list = []
    for i in range(len(results_data)):
        current_index = results_data[i]
        current_obj = current_index['y']
        obj_type = current_obj['value']
        print(('\t' + obj_type))
        type_list.append(obj_type)
    return type_list


if __name__ == "__main__":
    main()
