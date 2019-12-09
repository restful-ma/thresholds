import os
import math
import json
import matplotlib.pyplot as plt
import pandas as pd


def save(path, ext='png', close=True, verbose=True, x='', y=''):
    """Save a figure from pyplot.
    Parameters
    ----------
    path : string
        The path (and filename, without the extension) to save the
        figure to.
    ext : string (default='png')
        The file extension. This must be supported by the active
        matplotlib backend (see matplotlib.backends module).  Most
        backends support 'png', 'pdf', 'ps', 'eps', and 'svg'.
    close : boolean (default=True)
        Whether to close the figure after saving.  If you want to save
        the figure multiple times (e.g., to multiple formats), you
        should NOT close it in between saves or you will have to
        re-plot it.
    verbose : boolean (default=True)
        Whether to print information about when and where the image
        has been saved.
    """

    # Extract the directory and filename from the given path
    directory = os.path.split(path)[0]
    filename = "%s.%s" % (os.path.split(path)[1], ext)
    if directory == '':
        directory = '.'

    # If the directory does not exist, create it
    if not os.path.exists(directory):
        os.makedirs(directory)

    # The final path to save to
    savepath = os.path.join(directory, filename)

    if verbose:
        print("Saving figure to '%s'..." % savepath),

    plt.xlabel(x)
    plt.ylabel(y)
    # Actually save the figure
    plt.savefig(savepath, bbox_inches="tight", dpi=300)

    # Close it
    if close:
        plt.close()

    if verbose:
        print("Done")


# predefine some ranges for histograms
metricRanges = {
    "WeightedServiceInterfaceCount": {
        "range": [0, 100]
    },
    "ArgumentsPerOperation": {},
    "AveragePathLength": {},
    "BiggestRootCoverage": {
        "range": [0, 1]
    },
    "DataWeight": {
        "range": [0, 1000]
    },
    "DistinctMessageRatio": {
        "range": [0, 1]
    },
    "LongestPath": {},
    "NumberOfRootPaths": {
        "range": [0, 40]
    },
    "ServiceInterfaceDataCohesion": {
        "range": [0, 1]
    },
    "LackOfMessageLevelCohesion": {
        "range": [0, 1]
    }
}

# constants denoting path / file name of pictures
box = "box/"
box_suffix = "-box"
hist = "hist/"
hist_suffix = "-hist"
area = "area/"
area_suffix = "-area"

# filePath = input("Enter file path: ")
# df = pd.read_csv(filePath)
df = pd.read_csv("results.csv")

# limit evaluated files to APIs with more than 4 operations
df = df.query("WeightedServiceInterfaceCount > 4")
spec_format_groups = df.groupby("specFormat")

results = {"metrics": {}}

for headerName, data in df.iteritems():
    if headerName == "FILE-NAME":
        continue
    elif headerName == "specFormat":
        temp = json.loads(spec_format_groups.count().to_json())
        results["formats"] = temp[next(iter(temp))]
    else:
        results["metrics"][headerName] = {"all": json.loads(
            data.describe().to_json(double_precision=4))}

        df.boxplot(column=headerName, showfliers=False)
        save(box + headerName + box_suffix)

        if "range" not in metricRanges[headerName]:
            metricRanges[headerName]["range"] = [
                df[headerName].min(), df[headerName].max()]

        bins = int(math.ceil(
            metricRanges[headerName]["range"][1] - metricRanges[headerName]["range"][0]))
        if bins > 100:
            bins = 100
        elif bins == 1:
            bins = 20

        if metricRanges[headerName]["range"][1] != 1:
            df[headerName].hist(bins=range(int(metricRanges[headerName]["range"][0]), int(
                metricRanges[headerName]["range"][1]) + 1, 1), range=metricRanges[headerName]["range"])
        else:
            df[headerName].hist(
                bins=bins, range=metricRanges[headerName]["range"])
        save(hist + headerName + hist_suffix,
             x=headerName, y='specification files')

        df[headerName].plot.area()
        save(area + headerName + area_suffix)

        df.boxplot(column=headerName, showfliers=False, by="specFormat")
        save(box + headerName + "_format" + box_suffix)

        for specFormat in spec_format_groups.groups.keys():
            results["metrics"][headerName][specFormat] = \
                json.loads(spec_format_groups.get_group(specFormat)[
                           headerName].describe().to_json(double_precision=4))

            spec_format_groups.get_group(specFormat).boxplot(
                column=headerName, showfliers=False)
            save(box + headerName + "_" + specFormat + box_suffix)

            if metricRanges[headerName]["range"][1] != 1:
                spec_format_groups.get_group(specFormat)[headerName].hist(bins=range(int(metricRanges[headerName]["range"][0]), int(
                    metricRanges[headerName]["range"][1]) + 1, 1), range=metricRanges[headerName]["range"])
            else:
                spec_format_groups.get_group(specFormat)[headerName].hist(
                    bins=bins, range=metricRanges[headerName]["range"])
            save(hist + headerName + "_" + specFormat +
                 hist_suffix, x=headerName, y='specification files')

            spec_format_groups.get_group(specFormat)[headerName].plot.area()
            save(area + headerName + "_" + specFormat + area_suffix)

with open("results.json", "w") as json_file:
    json.dump(results, json_file)
